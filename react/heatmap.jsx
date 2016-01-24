var CRIMES_API = 'https://api.everyblock.com/content/philly/topnews/?format=json&schema=crime&schema=announcements&token=90fe24d329973b71272faf3f5d17a8602bff996b';

Parse.initialize("bTjai3wsSTvMmBPCyLFjPUHHSQYOUt4qOecyE8eh", "P7ARareRYBpxqoaU6CrDXr8cP5vv6wkuykeub6Ee");

var HeatMap = React.createClass({
  componentDidMount: function() {
    var map = new google.maps.Map(ReactDOM.findDOMNode(this), this.props.options);
    var heatmap = new google.maps.visualization.HeatmapLayer({
      data: this.props.points,
      map: map,
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

    heatmap.set('radius', 50);
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
    query.descending("createdAt");
    query.find({
      success: function(child) {
        for (i = 0; i < child.length; i++) {
          if (i == child.length-1) {
            that.setState({childLocation: {lat: child[i].get("latitude"), lng: child[i].get("longitude"), time: child[i].get("createdAt")}});
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

var SideBar = React.createClass({
  getInitialState: function() {
    return {
      child: null,
      streets: [],
    };
  },

  componentDidMount: function() {
    this.loadChild();
  },

  loadChild: function() {
    var that = this;
    var Child = Parse.Object.extend('Child');
    var query = new Parse.Query(Child);
    query.descending("createdAt");
    query.find({
      success: function(child) {
        that.setState({child: child});
        var streets = [];
        $.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${child[child.length-1].get('latitude')},${child[child.length-1].get('longitude')}&key=AIzaSyAp_CEJWpEwTNfREe5Qfgc01nKiy5-a93o`, function(data) {
          streets.push(`${data.results[0].address_components[0].long_name} ${data.results[0].address_components[1].long_name}`);
        });
        $.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${child[child.length-2].get('latitude')},${child[child.length-2].get('longitude')}&key=AIzaSyAp_CEJWpEwTNfREe5Qfgc01nKiy5-a93o`, function(data) {
          streets.push(`${data.results[0].address_components[0].long_name} ${data.results[0].address_components[1].long_name}`);
          that.setState({streets: streets});
        });
      }
    });

  },

  onEmergency: function() {
    Parse.Push.send({
      where: new Parse.Query(Parse.Installation),
      data: {alert: 'GTFO'},
    });
  },

  render: function() {
    if (this.state.child && this.state.streets) {
      console.log(this.state.child);
      return (
        <div id="rightNavBar" className="col-md-3 nopadding">
          <div className="about">
            <img src="img/test.png" className="col-md-3" style={{borderRadius: '50%'}} width="50px" />
            <div className="col-md-8" ><h1 style={{marginTop: '18px'}}>Aakash Adesara </h1></div>
          </div>

          <div className="location"> 
            <div className="col-md-12"><h3>LOCATION DETAILS</h3></div><br /><br /><br />
            <div className="col-md-12"><h5>Last Update: </h5></div>
            <div className="col-md-12"><p>{moment(this.state.child[0].get('createdAt')).calendar()}</p></div>
            <br />
            <div className="col-md-12"><h5>Last Location: </h5></div>
            <div className="col-md-12"><p>{this.state.streets[0]}</p></div>
          </div>

          <div className="history">
            <div className="col-md-12"><h3>AAKASH'S HISTORY</h3></div><br /><br /><br />
            <div className="col-md-12"><h5>{moment(this.state.child[1].get('createdAt')).fromNow()}: </h5></div>
            <div className="col-md-12"><p>{this.state.streets[0]}</p></div>
            <div className="col-md-12"><button className="go">View Map</button></div>
            <div className="col-md-12"><h5>{moment(this.state.child[2].get('createdAt')).fromNow()}: </h5></div>
            <div className="col-md-12"><p>{this.state.streets[1]}</p></div>
            <div className="col-md-12"><button className="go">View Map</button></div>
          </div>
          <div className="red"><button className="r" onClick={this.onEmergency}><h1>EMERGENCY</h1></button></div>
        </div>
      )
    } else {
      return <div>Loading...</div> 
    }
  }
});

var Content = React.createClass({
  render: function() {
    return (
      <div>
        <SideBar />
        <CrimesMap />
      </div>   
    )
  }
});

ReactDOM.render(<Content />, document.getElementById('react'));
