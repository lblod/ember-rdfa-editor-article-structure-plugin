import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { structureTypes } from '../utils/constants';

export default class EditorPluginsStructureCardComponent extends Component {
  @tracked isOutsideStructure = true;
  @tracked structureUri = undefined;
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
  moveStructure(moveUp) {
    this.args.controller.executeCommand(
      'move-structure',
      this.args.controller,
      this.structureUri,
      moveUp
    );
  }

  @action
  removeStructure() {
    this.args.controller.executeCommand(
      'delete-node-from-uri',
      this.args.controller,
      this.structureUri,
      'structure'
    );
  }

  @action
  selectionChangedHandler() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );

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
        this.canMoveUp = this.args.controller.canExecuteCommand(
          'move-structure',
          this.args.controller,
          this.structureUri,
          true
        );
        this.canMoveDown = this.args.controller.canExecuteCommand(
          'move-structure',
          this.args.controller,
          this.structureUri,
          false
        );
      } else {
        this.isOutsideStructure = true;
        this.structureUri = undefined;
      }
    }
  }
}
