import Route from '@ember/routing/route';
import $ from 'jquery';

export default class ApplicationRoute extends Route {
  async model() {
    
    var drives = null;
    console.log(  $("#back-button"));
    // $("#back-button").hide();
    console.log('model function called');
    try {
      console.log('promise created');
      const response = await $.ajax({
        url: 'http://localhost:8080/Explorer/HomePageServlet',
        type: 'GET',
      });

      console.log('success: ', response);
      drives = Object.values(response); // convert response object to array of drives
      console.log(drives);
    } catch (error) {
      console.log('error: ', error);
      throw error;
    }
    console.log('driving: ' + drives);
    return { drives };
  }


  

  
}
