export default class RecalculateArticleNumbersCommand {
  name = 'recalculate-article-numbers';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller) {
    const articles = controller.datastore
      .match(null, 'a', '>https://say.data.gift/ns/Article')
      .asPredicateNodes()
      .next().value;
    if (!articles) return;
    const articlesArray = [...articles.nodes];
    for (let i = 0; i < articlesArray.length; i++) {
      const article = articlesArray[i];
      this.replaceNumberIfNeeded(controller, article, i);
    }
  }
  replaceNumberIfNeeded(controller, article, index) {
    const articleNumberObjectNode = controller.datastore
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
      controller.executeCommand(
        'insert-text',
        String(articleNumberExpected),
        controller.rangeFactory.fromInNode(
          articleNumberElement,
          0,
          articleNumberElement.getMaxOffset()
        )
      );
    }
  }
}
