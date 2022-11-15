import { structureTypes } from '../utils/constants';

export default class MoveArticleCommand {
  name = 'move-article';

  constructor(model) {
    this.model = model;
  }

  canExecute(controller, articleUri, moveUp) {
    const articleSubjectNode = controller.datastore
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
        root: controller.modelRoot,
        start: articleNode,
        end: controller.modelRoot,
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

  execute(controller, articleUri, moveUp, options) {
    const articleSubjectNode = controller.datastore
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

      const articleARange = controller.rangeFactory.fromAroundNode(articleA);
      const articleBRange = controller.rangeFactory.fromAroundNode(articleB);
      const articleAToInsert = articleA.clone();
      const articleBToInsert = articleB.clone();
      this.model.change((mutator) => {
        mutator.insertNodes(articleBRange, articleAToInsert);
        mutator.insertNodes(articleARange, articleBToInsert);
      });
      controller.executeCommand(
        'recalculate-article-numbers',
        controller,
        options
      );
      this.model.change(() => {
        const range = controller.rangeFactory.fromInElement(
          articleAToInsert,
          0,
          0
        );
        controller.selection.selectRange(range);
      });
    } else {
      // Find next structure up the chain with a container ready for articles
      const treeWalker = new controller.treeWalkerFactory({
        root: controller.modelRoot,
        start: articleNode,
        end: controller.modelRoot,
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
          insertRange = controller.rangeFactory.fromInNode(
            structureContent,
            0,
            structureContent.getMaxOffset()
          );
        } else {
          insertRange = controller.rangeFactory.fromInNode(
            structureContent,
            structureContent.getMaxOffset(),
            structureContent.getMaxOffset()
          );
        }
        const originalContainer = articleNode.parent;
        const insertArticle = articleNode.clone();
        this.model.change((mutator) => {
          mutator.insertNodes(insertRange, insertArticle);
          mutator.deleteNode(articleNode);
        });
        if (originalContainer.children.length === 0) {
          controller.executeCommand(
            'insert-html',
            '<span class="mark-highlight-manual">Voer inhoud in</span>',
            controller.rangeFactory.fromInNode(
              originalContainer,
              0,
              originalContainer.getMaxOffset()
            )
          );
        }
        controller.executeCommand('recalculate-article-numbers', controller);
        this.model.change(() => {
          const range = controller.rangeFactory.fromInElement(
            insertArticle,
            0,
            0
          );
          controller.selection.selectRange(range);
        });
      }
    }
  }
}
