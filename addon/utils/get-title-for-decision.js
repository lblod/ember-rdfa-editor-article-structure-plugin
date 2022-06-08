export function getTitleForDecision(decisionUri, datastore) {
  const title = datastore
    .match(`>${decisionUri}`, '>http://data.europa.eu/eli/ontology#title', null)
    .asQuads()
    .next().value;
  if (title && title.object && title.object.value) {
    return title.object.value;
  } else {
    return null;
  }
}

/**
 * Gets all nodes defining a eli:title predicate for a certain
 * decision subject URI
 * @param decisionUri
 * @param datastore
 * @returns {null|*}
 */
export function getTitleNodesForDecision(decisionUri, datastore) {
  const mapping = datastore
    .match(`>${decisionUri}`, '>http://data.europa.eu/eli/ontology#title', null)
    .asPredicateNodeMapping()
    .single();
  if (mapping) {
    return mapping.nodes;
  } else {
    return null;
  }
}
