var CRIMES_API = 'https://api.everyblock.com/content/philly/topnews/?format=json&schema=crime&schema=announcements&token=90fe24d329973b71272faf3f5d17a8602bff996b';

var HeatMap = React.createClass({
  componentDidMount: function() {
    var map = new google.maps.Map(ReactDOM.findDOMNode(this), this.props.options);
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.props.points,
      map: map
    });

    heatmap.setMap(map);
  },

  render: function() {
    return <div id="map" />
  }
});

var CrimesMap = React.createClass({
  getInitialState: function() {
    return {
      points: null,
      options: {zoom: 13, center: {lat: 39.9521950, lng: -75.1911030}, mapTypeId: google.maps.MapTypeId.SATELLITE}
    };
  },

  componentDidMount: function() {
    var that = this;

    $.ajax({
      url: CRIMES_API,
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        var points = [];
        var results = data.results;
        for (var i=0; i<results.length; i++) {
          points.push(new google.maps.LatLng(results[i].location_coordinates[0].latitude, results[i].location_coordinates[0].longitude));
        }

        that.setState({points: points});
      }
    });
  },

  render: function() {
    if (this.state.points) {
      return <HeatMap points={this.state.points} options={this.state.options} />
    } else {
      return <div>Loading...</div> 
    }
  }
});

var Sidebar = React.createClass({
  render: function() {
    return (
      <div id="sidebar">
        <h1>Sidebar</h1>
      </div>
    ) 
  }
});

var Content = React.createClass({
  render: function() {
    return (
      <div>
        <Sidebar />
        <CrimesMap />
      </div>   
    )
  }
});

ReactDOM.render(<Content />, document.getElementById('react'));
