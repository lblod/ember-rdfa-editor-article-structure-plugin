import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { structureTypes } from '../utils/constants';
import { modifiesSelection } from '../utils/step-checker';

export default class EditorPluginsStructureCardComponent extends Component {
  @tracked isOutsideStructure = true;
  @tracked structureUri = undefined;
  @tracked canMoveUp = false;
  @tracked canMoveDown = false;

  constructor() {
    super(...arguments);
    this.args.controller.addTransactionStepListener(this.onTransactionUpdate);
  }

  @action
  moveStructure(moveUp) {
    this.args.controller.perform((tr) => {
      tr.commands.moveStructure({
        controller: this.args.controller,
        structureUri: this.structureUri,
        moveUp,
      });
    });
  }

  @action
  removeStructure() {
    this.args.controller.perform((tr) => {
      tr.commands.deleteNodeFromUri({
        uri: this.structureUri,
        type: 'structure',
      });
    });
  }

  @action
  onTransactionUpdate(transaction, steps) {
    if (modifiesSelection(steps)) {
      const limitedDatastore = transaction
        .getCurrentDataStore()
        .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');

      const documentMatches = limitedDatastore
        .match(null, 'a', null)
        .transformDataset((dataset) => {
          return dataset.filter((quad) => {
            return structureTypes.includes(quad.object.value);
          });
        })
        .asPredicateNodeMapping()
        .single();
      if (
        documentMatches &&
        documentMatches.nodes &&
        documentMatches.nodes.length
      ) {
        const structure = documentMatches.nodes.pop();
        const structureUri = structure.getAttribute('resource');
        const headingMatch = limitedDatastore
          .match(`>${structureUri}`, '>https://say.data.gift/ns/heading', null)
          .asPredicateNodeMapping()
          .single();
        if (headingMatch && headingMatch.nodes && headingMatch.nodes.length) {
          this.isOutsideStructure = false;
          this.structureUri = structure.getAttribute('resource');
          this.canMoveUp = transaction.commands.moveStructure.canExecute({
            controller: this.args.controller,
            structureUri: this.structureUri,
            moveUp: true,
          });
          this.canMoveDown = transaction.commands.moveStructure.canExecute({
            controller: this.args.controller,
            structureUri: this.structureUri,
            moveUp: false,
          });
        } else {
          this.isOutsideStructure = true;
          this.structureUri = undefined;
        }
      }
    }
  }
}
