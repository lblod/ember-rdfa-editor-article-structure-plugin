import { v4 as uuid } from 'uuid';
import { structureTypes } from '../utils/constants';

export default class InsertArticleCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { controller, articleContent, options }) {
    const treeWalker = new controller.treeWalkerFactory({
      root: transaction.currentDocument,
      start: transaction.currentSelection.lastRange.start.parentElement,
      end: transaction.currentDocument,
      reverse: false,
      visitParentUpwards: true,
      filter: (node) => {
        const isStructureBody = node.getAttribute('property') === 'say:body';
        const isStructure = structureTypes.includes(
          node.parent.getAttribute('typeof')
        );
        if (isStructureBody && isStructure) {
          const substructures = node.children.filter((child) =>
            structureTypes.includes(child.getAttribute('typeof'))
          );
          if (substructures.length === 0) {
            return 0; // We accept the result
          }
        } else {
          const rdfaContainer =
            options && options.rdfaContainer
              ? options.rdfaContainer
              : 'https://say.data.gift/ns/DocumentContent';
          const isArticleContainer =
            node.getAttribute('typeof') === rdfaContainer;
          if (isArticleContainer) {
            const substructures = node.children.filter((child) =>
              structureTypes.includes(child.getAttribute('typeof'))
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
      insertRange = transaction.rangeFactory.fromInNode(
        articleContainerNode,
        0,
        articleContainerNode.getMaxOffset()
      );
    } else {
      insertRange = transaction.rangeFactory.fromInNode(
        articleContainerNode,
        articleContainerNode.getMaxOffset(),
        articleContainerNode.getMaxOffset()
      );
    }
    const articleUri = `http://data.lblod.info/artikels/${uuid()}`;
    const articleHtml = `
      <div property="say:hasPart" typeof="say:Article" resource="${articleUri}">
        <div property="say:heading">
          Artikel 
          <span property="eli:number" datatype="xsd:string"> 
            <span class="mark-highlight-manual">Voer inhoud in</span>
          </span>
          :
          <span property="ext:title"><span class="mark-highlight-manual">Voer inhoud in</span></span>
        </div>
        <span style="display:none;" property="eli:language" resource="http://publications.europa.eu/resource/authority/language/NLD" typeof="skos:Concept">&nbsp;</span>
        <div property="say:body" datatype='rdf:XMLLiteral'>
        ${
          articleContent
            ? articleContent
            : '<span class="mark-highlight-manual">Voer inhoud in</span>'
        }
        </div>
      </div>
    `;
    transaction.commands.insertHtml({
      htmlString: articleHtml,
      range: insertRange,
    });
    const newArticleElementSubjectNodes = transaction
      .getCurrentDataStore()
      .match(`>${articleUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    transaction.commands['recalculate-article-numbers']({});
    if (newArticleElementSubjectNodes) {
      const newArticleElement = [...newArticleElementSubjectNodes.nodes][0];
      const range = transaction.rangeFactory.fromInElement(
        newArticleElement,
        0,
        0
      );
      transaction.selectRange(range);
    }
  }
  removeZeroWidthSpace(text) {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
  }
}
