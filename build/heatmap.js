var CRIMES_API = 'https://api.everyblock.com/content/philly/topnews/?format=json&schema=crime&schema=announcements&token=90fe24d329973b71272faf3f5d17a8602bff996b';

var HeatMap = React.createClass({
  displayName: 'HeatMap',

  componentDidMount: function () {
    var map = new google.maps.Map(ReactDOM.findDOMNode(this), this.props.options);
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.props.points,
      map: map
    });

    heatmap.setMap(map);
  },

  render: function () {
    return React.createElement('div', { id: 'map' });
  }
});

var CrimesMap = React.createClass({
  displayName: 'CrimesMap',

  getInitialState: function () {
    return {
      points: null,
      options: { zoom: 13, center: { lat: 39.9521950, lng: -75.1911030 }, mapTypeId: google.maps.MapTypeId.SATELLITE }
    };
  },

  componentDidMount: function () {
    var that = this;
    var results = [];
    var points = [];

    $.ajax({
      url: CRIMES_API,
      dataType: 'json',
      type: 'GET',
      success: function (data) {

        console.log(data.next);
        var results = data.results;

        $.ajax({
          url: CRIMES_API + '&page=2',
          dataType: 'json',
          type: 'GET',
          success: function (data) {
            results = results.concat(data.results);
            $.ajax({
              url: CRIMES_API + '&page=3',
              dataType: 'json',
              type: 'GET',
              success: function (data) {
                results = results.concat(data.results);
                $.ajax({
                  url: CRIMES_API + '&page=4',
                  dataType: 'json',
                  type: 'GET',
                  success: function (data) {
                    results = results.concat(data.results);
                    console.log(results);
                    for (var i = 0; i < results.length; i++) {
                      points.push(new google.maps.LatLng(results[i].location_coordinates[0].latitude, results[i].location_coordinates[0].longitude));
                    }
                    that.setState({ points: points });
                  }
                });
              }
            });
          }
        });
      }
    });
  },

  render: function () {
    if (this.state.points) {
      return React.createElement(HeatMap, { points: this.state.points, options: this.state.options });
    } else {
      return React.createElement(
        'div',
        null,
        'Loading...'
      );
    }
  }
});

var Sidebar = React.createClass({
  displayName: 'Sidebar',

  render: function () {
    return React.createElement(
      'div',
      { id: 'sidebar' },
      React.createElement(
        'h1',
        null,
        'Sidebar'
      )
    );
  }
});

var Content = React.createClass({
  displayName: 'Content',

  render: function () {
    return React.createElement(
      'div',
      null,
      React.createElement(Sidebar, null),
      React.createElement(CrimesMap, null)
    );
  }
});

ReactDOM.render(React.createElement(Content, null), document.getElementById('react'));