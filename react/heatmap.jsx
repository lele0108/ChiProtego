var CRIMES_API = 'https://api.everyblock.com/content/philly/topnews/?format=json&schema=crime&schema=announcements&token=90fe24d329973b71272faf3f5d17a8602bff996b';
Parse.initialize("bTjai3wsSTvMmBPCyLFjPUHHSQYOUt4qOecyE8eh", "P7ARareRYBpxqoaU6CrDXr8cP5vv6wkuykeub6Ee");

var HeatMap = React.createClass({
  componentDidMount: function() {
    var map = new google.maps.Map(ReactDOM.findDOMNode(this), this.props.options);
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.props.points,
      map: map
    });

    for (i = 0; i < this.props.prevLoc.length; i++) {
      var marker = new google.maps.Marker({
        position: this.props.prevLoc[i],
        map: map,
        title: 'Previous Location'
      });
    }

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

  render: function() {
    return <div id="map" />
  }
});

var CrimesMap = React.createClass({
  getInitialState: function() {
    return {
      points: null,
      prevLoc: null,
      childLocation: {lat: null, lng: null},
      options: {zoom: 14, center: {lat: 39.9521950, lng: -75.1911030}, mapTypeId: google.maps.MapTypeId.ROADMAP}
    };
  },

  componentDidMount: function() {
    this.loadCrimes();
    this.loadChild();
  },

  loadChild: function() {
    var that = this;
    var prevLoc = [];
    var Child = Parse.Object.extend('Child');
    var query = new Parse.Query(Child);
    query.find({
      success: function(child) {
        for (i = 0; i < child.length; i++) {
          if (i == child.length-1) {
            that.setState({childLocation: {lat: child[i].get("latitude"), lng: child[i].get("longitude")}});
          } else {
            prevLoc.push({lat: child[i].get("latitude"), lng: child[i].get("longitude"), time: child[i].get("createdAt")});
          }
        }
        that.setState({prevLoc: prevLoc});
        console.log(prevLoc);
      } 
    });
  },

  loadCrimes: function() {
    var that = this;
    var results = [];
    var points = [];

    $.ajax({
      url: CRIMES_API,
      dataType: 'json',
      type: 'GET',
      success: function(data) {

        console.log(data.next);
        var results = data.results;

        $.ajax({
          url: CRIMES_API + '&page=2',
          dataType: 'json',
          type: 'GET',
          success: function(data) {
            results = results.concat(data.results);
            $.ajax({
              url: CRIMES_API + '&page=3',
              dataType: 'json',
              type: 'GET',
              success: function(data) {
                results = results.concat(data.results);
                $.ajax({
                  url: CRIMES_API + '&page=4',
                  dataType: 'json',
                  type: 'GET',
                  success: function(data) {
                    results = results.concat(data.results);
                    console.log(results);
                    for (var i=0; i<results.length; i++) {
                      points.push(new google.maps.LatLng(results[i].location_coordinates[0].latitude, results[i].location_coordinates[0].longitude));
                    }
                    that.setState({points: points});
                  }
                });

              }
            });

          }
        });

      }
    });
  },

  render: function() {
    if (this.state.points && this.state.childLocation) {
      return <HeatMap points={this.state.points} options={this.state.options} circleCenter={this.state.childLocation} prevLoc={this.state.prevLoc} />
    } else {
      return <div>Loading...</div> 
    }
  }
});


var Content = React.createClass({
  render: function() {
    return (
      <div>
        <CrimesMap />
      </div>   
    )
  }
});

ReactDOM.render(<Content />, document.getElementById('react'));
