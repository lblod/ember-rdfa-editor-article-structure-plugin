export default class MoveParagraphCommand {
  name = 'move-paragraph';

  constructor(model) {
    this.model = model;
  }

  canExecute(controller, paragraphUri, moveUp) {
    const paragraphSubjectNode = controller.datastore
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
      const articles = controller.datastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
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

  execute(controller, paragraphUri, moveUp) {
    const paragraphSubjectNode = controller.datastore
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
        controller.rangeFactory.fromAroundNode(paragraphA);
      const paragraphBRange =
        controller.rangeFactory.fromAroundNode(paragraphB);
      const paragraphAToInsert = paragraphA.clone();
      const paragraphBToInsert = paragraphB.clone();
      this.model.change((mutator) => {
        mutator.insertNodes(paragraphBRange, paragraphAToInsert);
        mutator.insertNodes(paragraphARange, paragraphBToInsert);
      });
      controller.executeCommand(
        'recalculate-paragraph-numbers',
        controller,
        paragraphContainer
      );
      this.model.change(() => {
        const range = controller.rangeFactory.fromInElement(
          paragraphAToInsert,
          0,
          0
        );
        controller.selection.selectRange(range);
      });
    } else {
      const articles = controller.datastore
        .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Artikel')
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
          (child) => child.getAttribute('property') === 'prov:value'
        )[0];
        let insertRange;
        if (
          articleContent.children.length === 1 &&
          articleContent.children[0].getAttribute('class') ===
            'mark-highlight-manual'
        ) {
          insertRange = controller.rangeFactory.fromInNode(
            articleContent,
            0,
            articleContent.getMaxOffset()
          );
        } else {
          insertRange = controller.rangeFactory.fromInNode(
            articleContent,
            articleContent.getMaxOffset(),
            articleContent.getMaxOffset()
          );
        }
        const originalContainer = paragraphNode.parent;
        const insertparagraph = paragraphNode.clone();
        this.model.change((mutator) => {
          mutator.insertNodes(insertRange, insertparagraph);
          mutator.deleteNode(paragraphNode);
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
        controller.executeCommand(
          'recalculate-paragraph-numbers',
          controller,
          paragraphContainer
        );
        controller.executeCommand(
          'recalculate-paragraph-numbers',
          controller,
          articleContent
        );
        this.model.change(() => {
          const range = controller.rangeFactory.fromInElement(
            insertparagraph,
            0,
            0
          );
          controller.selection.selectRange(range);
        });
      }
    }
  }
}
