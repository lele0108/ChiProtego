function getAllResults(data, callback) {
  var results = [];
  nextPage(data);

  function nextPage(data) {
    results = results.concat(data.results);

    if (data.next != null) {
      $.get(data.next, nextPage);
    } else {
      callback(results);
    }
  }
}
