export default class RecalculateArticleNumbersCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }) {
    const articles = transaction
      .getCurrentDataStore()
      .match(null, 'a', '>https://say.data.gift/ns/Article')
      .asPredicateNodes()
      .next().value;
    if (!articles) return;
    const articlesArray = [...articles.nodes];
    for (let i = 0; i < articlesArray.length; i++) {
      const article = articlesArray[i];
      this.replaceNumberIfNeeded(transaction, article, i);
    }
  }
  replaceNumberIfNeeded(transaction, article, index) {
    const articleNumberObjectNode = transaction
      .getCurrentDataStore()
      .match(
        `>${article.getAttribute('resource')}`,
        '>http://data.europa.eu/eli/ontology#number',
        null
      )
      .asObjectNodes()
      .next().value;
    const articleNumber = Number(articleNumberObjectNode.object.value);
    const articleNumberElement = [...articleNumberObjectNode.nodes][0];
    const articleNumberExpected = index + 1;
    if (articleNumber !== articleNumberExpected) {
      transaction.commands.insertText({
        text: String(articleNumberExpected),
        range: transaction.rangeFactory.fromInNode(
          articleNumberElement,
          0,
          articleNumberElement.getMaxOffset()
        ),
      });
    }
  }
}
