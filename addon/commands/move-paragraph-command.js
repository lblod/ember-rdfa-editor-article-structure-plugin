export default class MoveParagraphCommand {
  canExecute(state, { paragraphUri, moveUp }) {
    const paragraphSubjectNode = state.datastore
      .match(`>${paragraphUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const paragraphNode = [...paragraphSubjectNode.nodes][0];
    const paragraphContainer = paragraphNode.parent;
    const paragraphs = paragraphContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const paragraphIndex = paragraphs.findIndex(
      (paragraph) => paragraph === paragraphNode
    );
    if (
      ((paragraphIndex !== 0 && moveUp) ||
        (paragraphIndex !== paragraphs.length - 1 && !moveUp)) &&
      paragraphs.length > 1
    ) {
      return true;
    } else {
      const articles = state.datastore
        .match(null, 'a', '>https://say.data.gift/ns/Article')
        .asPredicateNodes()
        .next().value;
      const articlesArray = [...articles.nodes];
      let nodeToInsert;
      for (let i = 0; i < articlesArray.length; i++) {
        const article = articlesArray[i];
        if (article === paragraphContainer.parent) {
          if (moveUp) {
            nodeToInsert = articlesArray[i - 1];
          } else {
            nodeToInsert = articlesArray[i + 1];
          }
        }
      }
      if (nodeToInsert) {
        return true;
      } else {
        return false;
      }
    }
  }

  execute(transaction, { paragraphUri, moveUp }) {
    const paragraphSubjectNode = transaction
      .getCurrentDataStore()
      .match(`>${paragraphUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const paragraphNode = [...paragraphSubjectNode.nodes][0];
    const paragraphContainer = paragraphNode.parent;
    const paragraphs = paragraphContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const paragraphIndex = paragraphs.findIndex(
      (paragraph) => paragraph === paragraphNode
    );
    if (
      ((paragraphIndex !== 0 && moveUp) ||
        (paragraphIndex !== paragraphs.length - 1 && !moveUp)) &&
      paragraphs.length > 1
    ) {
      const paragraphA = paragraphs[paragraphIndex];
      const bIndex = moveUp ? paragraphIndex - 1 : paragraphIndex + 1;
      const paragraphB = paragraphs[bIndex];

      const paragraphARange =
        transaction.rangeFactory.fromAroundNode(paragraphA);
      const paragraphBRange =
        transaction.rangeFactory.fromAroundNode(paragraphB);
      const paragraphAToInsert = paragraphA.clone();
      const paragraphBToInsert = paragraphB.clone();
      transaction.insertNodes(paragraphBRange, paragraphAToInsert);
      transaction.insertNodes(paragraphARange, paragraphBToInsert);
      transaction.commands['recalculate-paragraph-numbers']({
        container: paragraphContainer,
      });
      const range = transaction.rangeFactory.fromInElement(
        paragraphAToInsert,
        0,
        0
      );
      transaction.selectRange(range);
    } else {
      const articles = transaction
        .getCurrentDataStore()
        .match(null, 'a', '>https://say.data.gift/ns/Article')
        .asPredicateNodes()
        .next().value;
      const articlesArray = [...articles.nodes];
      let nodeToInsert;
      for (let i = 0; i < articlesArray.length; i++) {
        const article = articlesArray[i];
        if (article === paragraphContainer.parent) {
          if (moveUp) {
            nodeToInsert = articlesArray[i - 1];
          } else {
            nodeToInsert = articlesArray[i + 1];
          }
        }
      }
      if (nodeToInsert) {
        const articleContent = nodeToInsert.children.filter(
          (child) => child.getAttribute('property') === 'say:body'
        )[0];
        let insertRange;
        if (
          articleContent.children.length === 1 &&
          articleContent.children[0].getAttribute('class') ===
            'mark-highlight-manual'
        ) {
          insertRange = transaction.rangeFactory.fromInNode(
            articleContent,
            0,
            articleContent.getMaxOffset()
          );
        } else {
          insertRange = transaction.rangeFactory.fromInNode(
            articleContent,
            articleContent.getMaxOffset(),
            articleContent.getMaxOffset()
          );
        }
        const originalContainer = paragraphNode.parent;
        const insertparagraph = paragraphNode.clone();
        transaction.insertNodes(insertRange, insertparagraph);
        transaction.deleteNode(paragraphNode);
        if (originalContainer.children.length === 0) {
          const range = transaction.rangeFactory.fromInNode(
            originalContainer,
            0,
            originalContainer.getMaxOffset()
          );
          transaction.commands.insertHtml({
            htmlString:
              '<span class="mark-highlight-manual">Voer inhoud in</span>',
            range,
          });
        }
        transaction.commands['recalculate-paragraph-numbers']({
          container: paragraphContainer,
        });
        transaction.commands['recalculate-paragraph-numbers']({
          container: articleContent,
        });
        const range = transaction.rangeFactory.fromInElement(
          insertparagraph,
          0,
          0
        );
        transaction.selectRange(range);
      }
    }
  }
}
