
if (TM) {


    TM.SeedData = {
        "tm-taskList": [
          {
            "id": "785420182",
            "name": "Kristi",
            "group": "developers"
          },
          {
            "id": "489676733",
            "name": "George",
            "group": "designers"
          }
        ],

        "tm-tasks": [
          {
            "id": "456068173",
            "title": "One",
            "date": new Date('2/12/13 2:20 PM'),
            "color": "black",
            "complete": false,
            "owner" : "785420182",
            "parent_id": null,
            "expanded": true
          },
          {
            "id": "451356373",
            "title": "Two",
            "date": new Date('1/10/13 12:10 PM'),
            "color": "black",
            "complete": false,
            "owner" : "489676733",
            "parent_id": null,
            "expanded": true
          },
          {
            "id": "45235173",
            "title": "Three",
            "date": new Date('2/15/13 9:30 AM'),
            "color": "black",
            "complete": false,
            "owner" : "785420182",
            "parent_id": null,
            "expanded": true
          },
          {
            "id": "456458173",
            "title": "Four - child of One",
            "date": new Date('3/2/13 7:30 AM'),
            "color": "red",
            "complete": false,
            "owner" : "785420182",
            "parent_id": "456068173",
            "expanded": true
          },
          {
            "id": "416068179",
            "title": "Five - child of Four",
            "date": new Date(),
            "color": "black",
            "complete": false,
            "owner" : "785420182",
            "parent_id": "456458173",
            "expanded": true
          },
          {
            "id": "4112346179",
            "title": "Six - child of Four",
            "date": new Date(),
            "color": "black",
            "complete": false,
            "owner" : "785420182",
            "parent_id": "456458173",
            "expanded": true
          },
          {
            "id": "411212358179",
            "title": "Seven - child of Six",
            "date": new Date(),
            "color": "black",
            "complete": false,
            "owner" : "785420182",
            "parent_id": "4112346179",
            "expanded": true
          }
        ]

    };

    // for debug: console-level means to clear app data.
    TM.clearData = function() {
      localStorage.removeItem('tm-tasks');
      localStorage.removeItem('tm-taskList');
    };

    $(function(){
      var taskListData = localStorage.getItem('tm-taskList')
        , taskData = localStorage.getItem('tm-tasks');


        // Fill with seed data for dev if we haven't already
        if(!taskListData && !taskData) {
            var taskListSeed = JSON.stringify(TM.SeedData['tm-taskList'])
              , taskSeed = JSON.stringify(TM.SeedData['tm-tasks']);
            localStorage.setItem('tm-taskList', taskListSeed);
            localStorage.setItem('tm-tasks', taskSeed);
        }

      var taskmanager = new TM.TaskManager('#taskManager');


    });

}
