var CRIMES_JSON = 'https://api.everyblock.com/content/philly/topnews/?format=json&schema=crime&schema=announcements&token=90fe24d329973b71272faf3f5d17a8602bff996b';

var Crimes = React.createClass({
  getInitialState: function() {
    return {
      crimes: []
    };
  },

  componentDidMount: function() {
    var that = this;

    $.ajax({
      url: CRIMES_JSON,
      dataType: 'json',
      type: 'GET',
      success: function(data) {
        that.setState({crimes: data.results});
      }
    });
  },

  render: function() {
    console.log(this.state.crimes);
    return <div>Hello World</div>  
  }
});

ReactDOM.render(<Crimes />, document.getElementById('react'));
