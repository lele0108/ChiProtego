var CRIMES_API = 'https://api.everyblock.com/content/philly/topnews/?format=json&schema=crime&schema=announcements&token=90fe24d329973b71272faf3f5d17a8602bff996b';
Parse.initialize("bTjai3wsSTvMmBPCyLFjPUHHSQYOUt4qOecyE8eh", "P7ARareRYBpxqoaU6CrDXr8cP5vv6wkuykeub6Ee");

var HeatMap = React.createClass({
  displayName: "HeatMap",

  componentDidMount: function () {
    var map = new google.maps.Map(ReactDOM.findDOMNode(this), this.props.options);
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.props.points,
      map: map
    });

    var circle = new google.maps.Circle({
      strokeColor: '#82CAFA',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#82CAFA',
      fillOpacity: 0.35,
      map: map,
      center: this.props.circleCenter,
      radius: 250
    });

    heatmap.setMap(map);
  },

  render: function () {
    return React.createElement("div", { id: "map" });
  }
});

var CrimesMap = React.createClass({
  displayName: "CrimesMap",

  getInitialState: function () {
    return {
      points: null,
      childLocation: { lat: null, lng: null },
      options: { zoom: 13, center: { lat: 39.9521950, lng: -75.1911030 }, mapTypeId: google.maps.MapTypeId.ROADMAP }
    };
  },

  componentDidMount: function () {
    this.loadCrimes();
    this.loadChild();
  },

  loadChild: function () {
    var that = this;

    var Child = Parse.Object.extend('Child');
    var query = new Parse.Query(Child);
    query.limit(1);
    query.find({
      success: function (child) {
        that.setState({ childLocation: { lat: child[0].get("latitude"), lng: child[0].get("longitude") } });
      }
    });
  },

  loadCrimes: function () {
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
    if (this.state.points && this.state.childLocation) {
      return React.createElement(HeatMap, { points: this.state.points, options: this.state.options, circleCenter: this.state.childLocation });
    } else {
      return React.createElement(
        "div",
        null,
        "Loading..."
      );
    }
  }
});

var Content = React.createClass({
  displayName: "Content",

  render: function () {
    return React.createElement(
      "div",
      null,
      React.createElement(CrimesMap, null)
    );
  }
});

ReactDOM.render(React.createElement(Content, null), document.getElementById('react'));