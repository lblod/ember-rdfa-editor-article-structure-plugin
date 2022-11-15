import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsParagraphCardComponent extends Component {
  @tracked isOutsideParagraph = true;
  @tracked paragrahUri = undefined;
  @tracked canMoveUp = false;
  @tracked canMoveDown = false;

  constructor() {
    super(...arguments);
    this.args.controller.onEvent(
      'selectionChanged',
      this.selectionChangedHandler
    );
  }

  @action
  moveParagraph(moveUp) {
    this.args.controller.executeCommand(
      'move-paragraph',
      this.args.controller,
      this.paragrahUri,
      moveUp,
      this.args.widgetArgs.options
    );
  }

  @action
  removeParagraph() {
    this.args.controller.executeCommand(
      'delete-node-from-uri',
      this.args.controller,
      this.paragrahUri,
      'paragraph',
      this.args.widgetArgs.options
    );
  }

  @action
  selectionChangedHandler() {
    const currentSelection = this.args.controller.selection.lastRange;
    if (!currentSelection) {
      return;
    }
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      currentSelection,
      'rangeIsInside'
    );

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
      this.canMoveUp = this.args.controller.canExecuteCommand(
        'move-paragraph',
        this.args.controller,
        this.paragrahUri,
        true
      );
      this.canMoveDown = this.args.controller.canExecuteCommand(
        'move-paragraph',
        this.args.controller,
        this.paragrahUri,
        false
      );
    }
  }
}
