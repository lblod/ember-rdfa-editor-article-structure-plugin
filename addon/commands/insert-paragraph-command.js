import { v4 as uuid } from 'uuid';

export default class InsertParagraphCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { articleUri }) {
    const articleContentObjectNode = transaction
      .getCurrentDataStore()
      .match(`>${articleUri}`, '>https://say.data.gift/ns/body', null)
      .asObjectNodes()
      .next().value;
    const articleContentElement = [...articleContentObjectNode.nodes].find(
      (node) => node.getAttribute('property') === 'say:body'
    );
    const paragraphUri = `http://data.lblod.info/paragraph/${uuid()}`;
    if (
      articleContentElement.children.length > 1 ||
      articleContentElement.children[0].attributeMap.get('typeof') ===
        'say:Paragraph'
    ) {
      const paragraphHtml = `
        <div property="say:hasParagraph" typeof="say:Paragraph" resource="${paragraphUri}">
          §<span property="eli:number" datatype="xsd:string">${this.generateParagraphNumber(
            articleContentElement
          )}</span>.
          <span class="mark-highlight-manual">Voer inhoud in</span>
        </div>
      `;
      transaction.commands.insertHtml({
        htmlString: paragraphHtml,
        range: transaction.rangeFactory.fromInElement(
          articleContentElement,
          articleContentElement.getMaxOffset(),
          articleContentElement.getMaxOffset()
        ),
      });
    } else {
      const paragraphHtml = `
        <div property="say:hasParagraph" typeof="say:Paragraph" resource="${paragraphUri}">
          §<span property="eli:number" datatype="xsd:string">1</span>. 
        </div>
      `;
      const children = [...articleContentElement.children];
      transaction.commands.insertHtml({
        htmlString: paragraphHtml,
        range: transaction.rangeFactory.fromInElement(
          articleContentElement,
          0,
          articleContentElement.getMaxOffset()
        ),
      });
      const paragraphInserted = [
        ...transaction
          .getCurrentDataStore()
          .match(`>${paragraphUri}`, null, null)
          .asSubjectNodes()
          .next().value.nodes,
      ][0];
      const rangeToInsertContent = transaction.rangeFactory.fromInNode(
        paragraphInserted,
        paragraphInserted.getMaxOffset(),
        paragraphInserted.getMaxOffset()
      );
      transaction.insertNodes(rangeToInsertContent, ...children);
      return;
    }
    const newParagraphElementSubjectNodes = transaction
      .getCurrentDataStore()
      .match(`>${paragraphUri}`, null, null)
      .asSubjectNodes()
      .next().value;
    if (newParagraphElementSubjectNodes) {
      const newParagraphElement = [...newParagraphElementSubjectNodes.nodes][0];
      const range = transaction.rangeFactory.fromInElement(
        newParagraphElement,
        1,
        1
      );
      transaction.selectRange(range);
    }
  }
  generateParagraphNumber(container) {
    const substructures = container.children.filter(
      (node) => node.getAttribute('typeof') === 'say:Paragraph'
    );
    return substructures.length + 1;
  }
}
