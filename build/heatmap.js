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

  render: function () {
    return React.createElement("div", { id: "map" });
  }
});

var CrimesMap = React.createClass({
  displayName: "CrimesMap",

  getInitialState: function () {
    return {
      points: null,
      prevLoc: null,
      childLocation: { lat: null, lng: null },
      options: { zoom: 14, center: { lat: 39.9521950, lng: -75.1911030 }, mapTypeId: google.maps.MapTypeId.ROADMAP }
    };
  },

  componentDidMount: function () {
    this.loadCrimes();
    this.loadChild();
  },

  loadChild: function () {
    var that = this;
    var prevLoc = [];
    var Child = Parse.Object.extend('Child');
    var query = new Parse.Query(Child);
    query.descending("createdAt");
    query.find({
      success: function (child) {
        for (i = 0; i < child.length; i++) {
          if (i == child.length - 1) {
            that.setState({ childLocation: { lat: child[i].get("latitude"), lng: child[i].get("longitude"), time: child[i].get("createdAt") } });
          } else {
            prevLoc.push({ lat: child[i].get("latitude"), lng: child[i].get("longitude"), time: child[i].get("createdAt") });
          }
        }
        that.setState({ prevLoc: prevLoc });
        console.log(prevLoc);
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

        var results = data.results;

        $.ajax({
          url: CRIMES_API + '&page=17',
          dataType: 'json',
          type: 'GET',
          success: function (data) {
            results = results.concat(data.results);
            $.ajax({
              url: CRIMES_API + '&page=16',
              dataType: 'json',
              type: 'GET',
              success: function (data) {
                results = results.concat(data.results);
                $.ajax({
                  url: CRIMES_API + '&page=15',
                  dataType: 'json',
                  type: 'GET',
                  success: function (data) {
                    results = results.concat(data.results);
                    $.ajax({
                      url: CRIMES_API + '&page=13',
                      dataType: 'json',
                      type: 'GET',
                      success: function (data) {
                        results = results.concat(data.results);
                        $.ajax({
                          url: CRIMES_API + '&page=14',
                          dataType: 'json',
                          type: 'GET',
                          success: function (data) {
                            results = results.concat(data.results);
                            $.ajax({
                              url: CRIMES_API + '&page=12',
                              dataType: 'json',
                              type: 'GET',
                              success: function (data) {
                                results = results.concat(data.results);
                                $.ajax({
                                  url: CRIMES_API + '&page=11',
                                  dataType: 'json',
                                  type: 'GET',
                                  success: function (data) {
                                    results = results.concat(data.results);
                                    console.log(results);
                                    for (var i = 0; i < results.length; i++) {
                                      points.push(new google.maps.LatLng(results[i].location_coordinates[0].latitude, results[i].location_coordinates[0].longitude));
                                      console.log(results[i].item_date);
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
      return React.createElement(HeatMap, { points: this.state.points, options: this.state.options, circleCenter: this.state.childLocation, prevLoc: this.state.prevLoc });
    } else {
      return React.createElement(
        "div",
        null,
        "Loading..."
      );
    }
  }
});

var SideBar = React.createClass({
  displayName: "SideBar",

  getInitialState: function () {
    return {
      child: null,
      streets: []
    };
  },

  componentDidMount: function () {
    this.loadChild();
  },

  loadChild: function () {
    var that = this;
    var Child = Parse.Object.extend('Child');
    var query = new Parse.Query(Child);
    query.descending("createdAt");
    query.find({
      success: function (child) {
        that.setState({ child: child });
        var streets = [];
        $.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${ child[child.length - 1].get('latitude') },${ child[child.length - 1].get('longitude') }&key=AIzaSyAp_CEJWpEwTNfREe5Qfgc01nKiy5-a93o`, function (data) {
          streets.push(`${ data.results[0].address_components[0].long_name } ${ data.results[0].address_components[1].long_name }`);
        });
        $.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${ child[child.length - 2].get('latitude') },${ child[child.length - 2].get('longitude') }&key=AIzaSyAp_CEJWpEwTNfREe5Qfgc01nKiy5-a93o`, function (data) {
          streets.push(`${ data.results[0].address_components[0].long_name } ${ data.results[0].address_components[1].long_name }`);
          that.setState({ streets: streets });
        });
      }
    });
  },

  onEmergency: function () {
    Parse.Push.send({
      where: new Parse.Query(Parse.Installation),
      data: { alert: 'GTFO' }
    });
  },

  render: function () {
    if (this.state.child && this.state.streets) {
      console.log(this.state.child);
      return React.createElement(
        "div",
        { id: "rightNavBar", className: "col-md-3 nopadding" },
        React.createElement(
          "div",
          { className: "about" },
          React.createElement("img", { src: "img/test.png", className: "col-md-3", style: { borderRadius: '50%' }, width: "50px" }),
          React.createElement(
            "div",
            { className: "col-md-8" },
            React.createElement(
              "h1",
              { style: { marginTop: '18px' } },
              "Aakash Adesara "
            )
          )
        ),
        React.createElement(
          "div",
          { className: "location" },
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "h3",
              null,
              "LOCATION DETAILS"
            )
          ),
          React.createElement("br", null),
          React.createElement("br", null),
          React.createElement("br", null),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "h5",
              null,
              "Last Update: "
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "p",
              null,
              moment(this.state.child[0].get('createdAt')).calendar()
            )
          ),
          React.createElement("br", null),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "h5",
              null,
              "Last Location: "
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "p",
              null,
              this.state.streets[0]
            )
          )
        ),
        React.createElement(
          "div",
          { className: "history" },
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "h3",
              null,
              "AAKASH'S HISTORY"
            )
          ),
          React.createElement("br", null),
          React.createElement("br", null),
          React.createElement("br", null),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "h5",
              null,
              moment(this.state.child[1].get('createdAt')).fromNow(),
              ": "
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "p",
              null,
              this.state.streets[0]
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "button",
              { className: "go" },
              "View Map"
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "h5",
              null,
              moment(this.state.child[2].get('createdAt')).fromNow(),
              ": "
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "p",
              null,
              this.state.streets[1]
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "button",
              { className: "go" },
              "View Map"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "red" },
          React.createElement(
            "button",
            { className: "r", onClick: this.onEmergency },
            React.createElement(
              "h1",
              null,
              "EMERGENCY"
            )
          )
        )
      );
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
      React.createElement(SideBar, null),
      React.createElement(CrimesMap, null)
    );
  }
});

ReactDOM.render(React.createElement(Content, null), document.getElementById('react'));