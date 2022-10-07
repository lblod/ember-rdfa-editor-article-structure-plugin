import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { modifiesSelection } from '../utils/step-checker';

export default class EditorPluginsParagraphCardComponent extends Component {
  @tracked isOutsideParagraph = true;
  @tracked paragrahUri = undefined;
  @tracked canMoveUp = false;
  @tracked canMoveDown = false;

  constructor() {
    super(...arguments);
    this.args.controller.addTransactionStepListener(this.onTransactionUpdate);
  }

  willDestroy() {
    this.args.controller.removeTransactionStepListener(
      this.onTransactionUpdate
    );
    super.willDestroy();
  }

  @action
  moveParagraph(moveUp) {
    this.args.controller.perform((tr) => {
      tr.moveParagraph({
        paragraphUri: this.paragrahUri,
        moveUp,
      });
    });
  }

  @action
  removeParagraph() {
    this.args.controller.perform((tr) => {
      tr.deleteNodeFromUri({
        uri: this.paragrahUri,
        type: 'paragraph',
      });
    });
  }

  onTransactionUpdate = (transaction, steps) => {
    if (modifiesSelection(steps) && transaction.currentSelection.lastRange) {
      const limitedDatastore = transaction
        .getCurrentDataStore()
        .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');
      const paragraph = limitedDatastore
        .match(null, 'a', '>https://say.data.gift/ns/Paragraph')
        .asQuads()
        .next().value;
      if (!paragraph) {
        this.isOutsideParagraph = true;
        this.paragrahUri = undefined;
      } else {
        this.isOutsideParagraph = false;
        this.paragrahUri = paragraph.subject.value;
        this.canMoveUp = transaction.commands.moveParagraph.canExecute({
          paragraphUri: this.paragrahUri,
          moveUp: true,
        });
        this.canMoveDown = transaction.commands.moveParagraph.canExecute({
          paragraphUri: this.paragrahUri,
          moveUp: false,
        });
      }
    }
  };
}
