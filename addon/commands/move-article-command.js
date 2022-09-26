import { structureTypes } from '../utils/constants';

export default class MoveArticleCommand {
  canExecute(state, { controller, articleUri, moveUp }) {
    const articleSubjectNode = state.datastore
      .match(`>${articleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const articleNode = [...articleSubjectNode.nodes][0];
    const articleContainer = articleNode.parent;
    const articles = articleContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const articleIndex = articles.findIndex(
      (article) => article === articleNode
    );
    if (
      ((articleIndex !== 0 && moveUp) ||
        (articleIndex !== articles.length - 1 && !moveUp)) &&
      articles.length > 1
    ) {
      return true;
    } else {
      // Find next structure up the chain with a container ready for articles
      const treeWalker = new controller.treeWalkerFactory({
        root: state.document,
        start: articleNode,
        end: state.document,
        reverse: moveUp,
        filter: (node) => {
          const isStructure = structureTypes.includes(
            node.getAttribute('typeof')
          );
          if (isStructure) {
            const structureContent = node.children.filter(
              (child) => child.getAttribute('property') === 'say:body'
            )[0];
            const substructures = structureContent.children.filter((child) =>
              structureTypes.includes(child.getAttribute('typeof'))
            );
            if (substructures.length === 0) {
              return 0; // We accept the result
            }
          }
          return 1; // We skip this node
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      if (nodeToInsert) {
        return true;
      } else {
        return false;
      }
    }
  }

  execute({ transaction }, { controller, articleUri, moveUp }) {
    const articleSubjectNode = transaction
      .getCurrentDataStore()
      .match(`>${articleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const articleNode = [...articleSubjectNode.nodes][0];
    const articleContainer = articleNode.parent;
    const articles = articleContainer.children.filter(
      (child) => child.modelNodeType === 'ELEMENT'
    );
    const articleIndex = articles.findIndex(
      (article) => article === articleNode
    );
    if (
      ((articleIndex !== 0 && moveUp) ||
        (articleIndex !== articles.length - 1 && !moveUp)) &&
      articles.length > 1
    ) {
      const articleA = articles[articleIndex];
      const bIndex = moveUp ? articleIndex - 1 : articleIndex + 1;
      const articleB = articles[bIndex];

      const articleARange = transaction.rangeFactory.fromAroundNode(articleA);
      const articleBRange = transaction.rangeFactory.fromAroundNode(articleB);
      const articleAToInsert = articleA.clone();
      const articleBToInsert = articleB.clone();
      transaction.insertNodes(articleBRange, articleAToInsert);
      transaction.insertNodes(articleARange, articleBToInsert);
      transaction.commands['recalculate-article-numbers']();
      const range = transaction.rangeFactory.fromInElement(
        articleAToInsert,
        0,
        0
      );
      transaction.selectRange(range);
    } else {
      // Find next structure up the chain with a container ready for articles
      const treeWalker = new controller.treeWalkerFactory({
        root: transaction.currentDocument,
        start: articleNode,
        end: transaction.currentDocument,
        reverse: moveUp,
        filter: (node) => {
          const isStructure = structureTypes.includes(
            node.getAttribute('typeof')
          );
          if (isStructure) {
            const structureContent = node.children.filter(
              (child) => child.getAttribute('property') === 'say:body'
            )[0];
            const substructures = structureContent.children.filter((child) =>
              structureTypes.includes(child.getAttribute('typeof'))
            );
            if (substructures.length === 0) {
              return 0; // We accept the result
            }
          }
          return 1; // We skip this node
        },
      });
      const nodeToInsert = treeWalker.nextNode();
      if (nodeToInsert) {
        //Insert article last place in that structure
        const structureContent = nodeToInsert.children.filter(
          (child) => child.getAttribute('property') === 'say:body'
        )[0];
        let insertRange;
        if (
          structureContent.children.length === 1 &&
          structureContent.children[0].getAttribute('class') ===
            'mark-highlight-manual'
        ) {
          insertRange = transaction.rangeFactory.fromInNode(
            structureContent,
            0,
            structureContent.getMaxOffset()
          );
        } else {
          insertRange = transaction.rangeFactory.fromInNode(
            structureContent,
            structureContent.getMaxOffset(),
            structureContent.getMaxOffset()
          );
        }
        const originalContainer = articleNode.parent;
        const insertArticle = articleNode.clone();
        transaction.insertNodes(insertRange, insertArticle);
        transaction.deleteNode(articleNode);
        if (originalContainer.children.length === 0) {
          transaction.commands.insertHtml({
            htmlString:
              '<span class="mark-highlight-manual">Voer inhoud in</span>',
            range: transaction.rangeFactory.fromInNode(
              originalContainer,
              0,
              originalContainer.getMaxOffset()
            ),
          });
        }
        transaction.commands['recalculate-article-numbers']();
        const range = transaction.rangeFactory.fromInElement(
          insertArticle,
          0,
          0
        );
        transaction.selectRange(range);
      }
    }
  }
}
