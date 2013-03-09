<div class="tasklist" id="tasklist-{{id}}">
  <h4 class="list-header"><a href="#{{id}}"><span class="name">{{name}}</span> <span class="icon icon-circle-arrow-right"></span></a></h4>
  <ul class="tasks-block">
    {{>tasks}}
  </ul>
  <div class="task-add">
      <h5 class="task-add-header">New task</h5>
      <input class="new-task" type="text" name="taskName" data-id="{{id}}" placeholder="Add task and hit <enter>."></value>
  </div>
</div>