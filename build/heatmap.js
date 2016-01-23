var HeatMap = React.createClass({
  displayName: 'HeatMap',

  render: function () {
    return React.createElement(
      'div',
      null,
      'Heat Map'
    );
  }
});

ReactDOM.render(React.createElement(HeatMap, null), document.getElementById('react'));