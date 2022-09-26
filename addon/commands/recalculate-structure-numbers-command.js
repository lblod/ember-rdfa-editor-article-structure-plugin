import romanize from '../utils/romanize';
import { structureTypes } from '../utils/constants';

export default class RecalculateStructureNumbersCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { container, type }) {
    const structures = transaction
      .getCurrentDataStore()
      .limitToRange(
        transaction.rangeFactory.fromAroundNode(container),
        'rangeContains'
      )
      .match(null, 'a', `>${type}`)
      .transformDataset((dataset) => {
        return dataset.filter((quad) => {
          return structureTypes.includes(quad.object.value);
        });
      })
      .asPredicateNodes()
      .next().value;
    if (!structures) return;
    const structuresArray = [...structures.nodes];
    for (let i = 0; i < structuresArray.length; i++) {
      const structure = structuresArray[i];
      this.replaceNumberIfNeeded(transaction, structure, i);
    }
  }
  replaceNumberIfNeeded(transaction, structure, index) {
    const structureNumberObjectNode = transaction
      .getCurrentDataStore()
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
      const range = transaction.rangeFactory.fromInNode(
        structureNumberElement,
        0,
        structureNumberElement.getMaxOffset()
      );
      transaction.commands.insertText({
        text: structureNumberExpected,
        range,
      });
    }
  }
}
