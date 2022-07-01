function searchForType(generalDatastore, limitedDatastore, type) {
  return limitedDatastore.match(null, 'a', `>${type}`).asSubjectNodes().next()
    .value;
}

export default searchForType;
