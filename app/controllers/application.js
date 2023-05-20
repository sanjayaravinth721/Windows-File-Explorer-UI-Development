import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import $ from 'jquery';



export default class ApplicationController extends Controller {
  @tracked path = '';
  @tracked drive = '';
  @tracked root = '';

  @action
  setDrive(drive) {
    this.drive = drive;
    this.handleButtonClick(drive.replace("\\", ""));

  }



  @action
  handleButtonClick(driveName, currentPage = 1, totalPages = 1, ITEMS_PER_PAGE = 5) {
    // console.log("drive: " + driveName);
    this.path = driveName;
    const page = currentPage;
    console.log("this path: " + this.path);
    console.log("this root: " + this.root);
    // console.log('path:', this.path);
    // console.log('Drive name:', driveName);

    $.ajax({
      url: 'http://localhost:8080/Explorer/FolderServlet',
      type: 'GET',
      data: {

        drivename: this.path,
      },
      success: (data, textstatus, xhr) => {
        console.debug(data);
        if (this.path == "") {
          $("#back-button").hide();
          this.drive = this.root;
          $("h1").text("File Explorer");
        }
        else {
          $("#back-button").show();
          $("h1").text(this.path.substring(0, 1) + " DRIVE");
        }
        // console.log("data:  " + data);
        const buttonContainer = document.querySelector('#button-container');
        buttonContainer.innerHTML = '';


        // Calculate the start and end indices of the current page of items
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;

        // Display only the items for the current page
        const currentPageItems = data.slice(startIndex, endIndex);

        currentPageItems.forEach((drive) => {
          const button = document.createElement('button');
          button.classList.add('file-explorer-button');
          button.setAttribute('type', 'button');
          button.setAttribute("data-text", drive);
          button.setAttribute('title', drive);

          const separatorIndex = drive.lastIndexOf('\\');
          console.log('seperator Index:', separatorIndex, 'drive:', drive);

          //displaying only the name without path
          if (separatorIndex >= 0) {
            console.log('drive:', drive);
            drive = drive.substring(separatorIndex + 1);

            console.debug('drive name:', drive);
          }
          button.textContent = drive;

          button.addEventListener('click', () => {
            this.handleButtonClick(fullpath);
            document.body.classList.remove('hide-content');
          });
          buttonContainer.appendChild(button);
        });

        // Update the total number of pages based on the number of items
       totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);

        // Update the display of the pagination buttons
        const paginationContainer = document.querySelector('#pagination-container');
        paginationContainer.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
          const button = document.createElement('button');
          button.classList.add('pagination-button');
          button.setAttribute('type', 'button');
          button.textContent = i;
          if (i === this.currentPage) {
            button.classList.add('active');
          }
          button.addEventListener('click', () => {
            this.handleButtonClick(this.path, i);
          });
          paginationContainer.appendChild(button);
        }

        const driveButtonContainer = document.querySelector('#drive-button-container');
        driveButtonContainer.style.display = 'none';

        const folderButtonContainer = document.querySelector('#folder-button-container');
        folderButtonContainer.style.display = 'flex';

        const buttons = folderButtonContainer.querySelectorAll('.file-explorer-button');
        buttons.forEach((button) => {
          button.addEventListener('click', () => {
            this.handleClick();
          });
        });
      },
      error: (xhr, textstatus, errorThrown) => {
        console.debug(xhr.responseText);
      }
    });
  }


  @action
  handleClick() {
    const button = event.target;
    // console.log('id: ' + button.id);
    console.debug('clicking..');

    // console.log(button);

    const driveName = button.getAttribute('data-text');
    console.debug('driveName:', driveName);
    if (button.id !== 'back-button' || button.id !== 'searchBtn') {

      this.handleButtonClick(driveName);
      console.log("filepath: " + driveName);


      // $.ajax({
      //   url: 'http://localhost:8080/Explorer/FolderServlet',
      //   type: 'GET',
      //   data: {
      //     "selectedpath": drivename
      //   },
      //   success: (data, textstatus, xhr) => {
      //     console.log("selectedpath: "+data);
      //   },
      //   error: (xhr, textstatus, errorThrown) => {
      //     console.debug(xhr.responseText);
      //   }
      // });

    }

  }

  @action
  backTraverse() {
    // E:\\JNI PRAC\Checking JNI
    // E:\\JNI PRAC\
    console.log("back : " + this.path);
    this.root = this.path;
    if (this.path.length === 3) {
      this.path = "";

      this.handleButtonClick(this.path);

    }
    else {
      let filePath = this.path;
      let lastFolderIndex = filePath.lastIndexOf("\\");
      let path = filePath.substring(0, lastFolderIndex);

      console.log("new back : " + path);
      this.handleButtonClick(path);
    }

  }



  @action
  searchDirectory() {
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value;

    this.path = searchTerm;
    searchInput.value = "";
    this.handleButtonClick(this.path);
    $('#suggestions').hide();

  }


  @action
  search() {
    const searchTerm = event.target.value.trim();
    console.log('searching for:', searchTerm);

    if (!searchTerm) {
      $('#suggestions').hide();
      return;
    }

    const regex = /^[A-Z]:\\(?:[^\\\n]+\\)*$/;
    if (regex.test(searchTerm)) {
      console.log("searchTerm: " + searchTerm.substring(0, searchTerm.lastIndexOf("\\")));
      console.log("char backslash");
      $.ajax({
        url: 'http://localhost:8080/Explorer/FolderServlet',
        type: 'GET',
        data: {
          suggestion: searchTerm.substring(0, searchTerm.lastIndexOf("\\"))
        },
        success: (data, textstatus, xhr) => {
          console.log("data from suggestion...");
          console.log("data: " + data);
          // $("#suggestions").hide();
    
           if (data != "") {
            $("#suggestions").show();
            this.updateSuggestions(data);
          } else {
    
            console.log("it is null..");
            const suggestionsDiv = $('#suggestions');
            suggestionsDiv.empty();
            suggestionsDiv.show();
            const suggestionDiv = $('<div></div>');
            suggestionDiv.text("No result found!");
            suggestionDiv.css('margin-bottom', '5px');
           
            suggestionsDiv.append(suggestionDiv);
            suggestionsDiv.show();
          }
        },
        error: (xhr, textstatus, errorThrown) => {
          console.debug(xhr.responseText);
        }
      });
    } else {
      $("#suggestions").hide();
    }
  }
  @action
  updateSuggestions(data) {
    const suggestionsDiv = $('#suggestions');
    suggestionsDiv.empty();
    if (data.length > 0) {
      data.forEach((suggestion) => {
        const suggestionDiv = $('<div></div>');
        suggestionDiv.text(suggestion);
        suggestionDiv.css('margin-bottom', '5px');
        suggestionDiv.click(() => {
          $('#search-input').val(suggestion);
          $('#search-input').focus();
        });
        suggestionsDiv.append(suggestionDiv);
      });
    } else {
      const noResultsDiv = $('<div>No results</div>');
      suggestionsDiv.append(noResultsDiv);
    }
  }
}
