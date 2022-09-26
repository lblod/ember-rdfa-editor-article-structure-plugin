export default class DeleteNodeFromUriCommand {
  canExecute() {
    return true;
  }

  execute({ transaction }, { uri, type }) {
    const subjectNode = transaction
      .getCurrentDataStore()
      .match(`>${uri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const node = [...subjectNode.nodes][0];
    const container = node.parent;
    transaction.deleteNode(node);
    if (container.children.length === 0) {
      transaction.commands.insertHtml({
        htmlString: '<span class="mark-highlight-manual">Voer inhoud in</span>',
        range: transaction.rangeFactory.fromInNode(
          container,
          0,
          container.getMaxOffset()
        ),
      });
    }
    transaction.commands[`recalculate-${type}-numbers`]({ container });
  }
}
