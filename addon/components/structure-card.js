import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class EditorPluginsParagraphCardComponent extends Component {
  @tracked isOutsideStructure = true;
  @tracked structureUri = undefined;

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
      .match(null, 'a', '>https://say.data.gift/ns/DocumentSubdivision')
      .asPredicateNodeMapping()
      .single();
    if (
      documentMatches &&
      documentMatches.nodes &&
      documentMatches.nodes.length
    ) {
      const structure = documentMatches.nodes.pop();
      if (!structure) {
        this.isOutsideStructure = true;
        this.structureUri = undefined;
      } else {
        this.isOutsideStructure = false;
        this.structureUri = structure.getAttribute('resource');
      }
    }
  }
}
