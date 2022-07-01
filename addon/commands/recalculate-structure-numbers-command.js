import romanize from '../utils/romanize';

export default class RecalculateStructureNumbersCommand {
  name = 'recalculate-structure-numbers';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, container, type) {
    const structures = controller.datastore
      .limitToRange(
        controller.rangeFactory.fromAroundNode(container),
        'rangeContains'
      )
      .match(null, '>http://purl.org/dc/terms/type', `>${type}`)
      .asSubjectNodes()
      .next().value;
    if (!structures) return;
    const structuresArray = [...structures.nodes];
    for (let i = 0; i < structuresArray.length; i++) {
      const structure = structuresArray[i];
      this.replaceNumberIfNeeded(controller, structure, i);
    }
  }
  replaceNumberIfNeeded(controller, structure, index) {
    const structureNumberObjectNode = controller.datastore
      .match(
        `>${structure.getAttribute('resource')}`,
        '>http://data.europa.eu/eli/ontology#number',
        null
      )
      .asObjectNodes()
      .next().value;
    const structureNumber = structureNumberObjectNode.object.value;
    const structureNumberElement = [...structureNumberObjectNode.nodes][0];
    const structureNumberExpected = romanize(index + 1);
    if (structureNumber !== structureNumberExpected) {
      controller.executeCommand(
        'insert-text',
        structureNumberExpected,
        controller.rangeFactory.fromInNode(
          structureNumberElement,
          0,
          structureNumberElement.getMaxOffset()
        )
      );
    }
  }
}
