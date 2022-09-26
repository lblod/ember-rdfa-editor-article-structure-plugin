export default class RecalculateParagraphNumbersCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, container) {
    const paragraphs = transaction
      .getCurrentDataStore()
      .limitToRange(
        transaction.rangeFactory.fromAroundNode(container),
        'rangeContains'
      )
      .match(null, 'a', '>https://say.data.gift/ns/Paragraph')
      .asPredicateNodes()
      .next().value;
    if (!paragraphs) return;
    const paragraphsArray = [...paragraphs.nodes];
    for (let i = 0; i < paragraphsArray.length; i++) {
      const paragraph = paragraphsArray[i];
      this.replaceNumberIfNeeded(transaction, paragraph, i);
    }
  }
  replaceNumberIfNeeded(transaction, paragraph, index) {
    const paragraphNumberObjectNode = transaction
      .getCurrentDataStore()
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
      const range = transaction.rangeFactory.fromInNode(
        paragraphNumberElement,
        0,
        paragraphNumberElement.getMaxOffset()
      );
      transaction.insertText({
        text: String(paragraphNumberExpected),
        range,
      });
    }
  }
}
