export default class DeleteNodeFromUriCommand {
  name = 'delete-node-from-uri';

  constructor(model) {
    this.model = model;
  }

  canExecute() {
    return true;
  }

  execute(controller, uri, type) {
    const subjectNode = controller.datastore
      .match(`>${uri}`, null, null)
      .asSubjectNodes()
      .next().value;
    const node = [...subjectNode.nodes][0];
    const container = node.parent;
    this.model.change((mutator) => {
      mutator.deleteNode(node);
    });
    controller.executeCommand(
      `recalculate-${type}-numbers`,
      controller,
      container
    );
  }
}
