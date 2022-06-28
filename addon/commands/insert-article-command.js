import { v4 as uuid } from 'uuid';

export default class InsertArticleCommand {
  name = 'insert-article';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, articleContent) {
    const treeWalker = new controller.treeWalkerFactory({
      root: controller.modelRoot,
      start: controller.selection.lastRange._start.parentElement,
      end: controller.modelRoot,
      reverse: false,
      visitParentUpwards: true,
      filter: (node) => {
        const isStructureBody = node.getAttribute('property') === 'say:body';
        if (isStructureBody) {
          const substructures = node.children.filter(
            (child) =>
              child.getAttribute('typeof') === 'say:DocumentSubdivision'
          );
          if (substructures.length === 0) {
            return 0; // We accept the result
          }
        } else {
          const isArticleContainer =
            node.getAttribute('property') === 'prov:value' &&
            (!node.parent ||
              node.parent.getAttribute('typeof') !== 'besluit:Artikel');
          if (isArticleContainer) {
            const substructures = node.children.filter(
              (child) =>
                child.getAttribute('typeof') === 'say:DocumentSubdivision'
            );
            if (!substructures.length) {
              return 0; // We accept the result
            }
          }
        }
        return 1; // We skip this node
      },
    });
    const articleContainerNode = treeWalker.nextNode();
    let insertRange;
    if (
      articleContainerNode.children.length === 1 &&
      articleContainerNode.children[0].getAttribute('class') ===
        'mark-highlight-manual'
    ) {
      insertRange = controller.rangeFactory.fromInNode(
        articleContainerNode,
        0,
        articleContainerNode.getMaxOffset()
      );
    } else {
      insertRange = controller.rangeFactory.fromInNode(
        articleContainerNode,
        articleContainerNode.getMaxOffset(),
        articleContainerNode.getMaxOffset()
      );
    }
    const articleUri = `http://data.lblod.info/artikels/${uuid()}`;
    const articleHtml = `
      <div property="eli:has_part" prefix="mobiliteit: https://data.vlaanderen.be/ns/mobiliteit#" typeof="besluit:Artikel" resource="${articleUri}">
        <div>
          Artikel 
          <span property="eli:number" datatype="xsd:string"> 
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </span>
          :
          <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
        </div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="prov:value" datatype="xsd:string">
        ${
          articleContent
            ? articleContent
            : '<span class="mark-highlight-manual">Voer inhoud in</span>'
        }
        </div>
      </div>
    `;
    controller.executeCommand('insert-html', articleHtml, insertRange);
    const newArticleElementSubjectNodes = controller.datastore
      .match(`>${articleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    controller.executeCommand('recalculate-article-numbers', controller);
    if (newArticleElementSubjectNodes) {
      const newArticleElement = [...newArticleElementSubjectNodes.nodes][0];
      const range = controller.rangeFactory.fromInElement(
        newArticleElement,
        0,
        0
      );
      this.model.change(() => {
        controller.selection.selectRange(range);
      });
    }
  }
  removeZeroWidthSpace(text) {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }
}
