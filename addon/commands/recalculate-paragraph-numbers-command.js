export default class RecalculateParagraphNumbersCommand {
  name = 'recalculate-paragraph-numbers';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, container) {
    const paragraphs = controller.datastore
      .limitToRange(
        controller.rangeFactory.fromAroundNode(container),
        'rangeContains'
      )
      .match(null, 'a', 'ext:Paragraph')
      .asPredicateNodes()
      .next().value;
    if(!paragraphs) continue;
    const paragraphsArray = [...paragraphs.nodes];
    for (let i = 0; i < paragraphsArray.length; i++) {
      const paragraph = paragraphsArray[i];
      this.replaceNumberIfNeeded(controller, paragraph, i);
    }
  }
  replaceNumberIfNeeded(controller, paragraph, index) {
    const paragraphNumberObjectNode = controller.datastore
      .match(
        `>${paragraph.getAttribute('resource')}`,
        '>http://data.europa.eu/eli/ontology#number',
        null
      )
      .asObjectNodes()
      .next().value;
    const paragraphNumber = Number(paragraphNumberObjectNode.object.value);
    const paragraphNumberElement = [...paragraphNumberObjectNode.nodes][0];
    const paragraphNumberExpected = index + 1;
    if (paragraphNumber !== paragraphNumberExpected) {
      controller.executeCommand(
        'insert-text',
        String(paragraphNumberExpected),
        controller.rangeFactory.fromInNode(
          paragraphNumberElement,
          0,
          paragraphNumberElement.getMaxOffset()
        )
      );
    }
  }
}
