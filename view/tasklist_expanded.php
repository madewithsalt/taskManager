<div class="tasklist-expanded" data-id="{{id}}">
    <div class="list-header">
        <a class="return-link" href="/"><span class="icon icon-angle-left"></span></a><h2>Tasks for {{name}}</h2>
    </div>
    <div class="tasklist-wrapper">
      <div class="tasklist-inner">
        <div class="exp-tasklist tasks-undone">
          <h2 class="tasklist-label">Incomplete Tasks</h2>
          <div class="tasklist-content">
            {{^tasks_undone}}
                <h3 class="list-empty-label">Everything completed, yay!</h3>
            {{/tasks_undone}}

            {{#tasks_undone}}
                {{>weekly_task}}
            {{/tasks_undone}}
          </div>
        </div>
        <div class="exp-tasklist tasks-done">
          <h2 class="tasklist-label">Complete Tasks</h2>
          <div class="tasklist-content">
            {{^tasks_done}}
                <h3 class="list-empty-label">No completed tasks yet, get crackin'!</h3>
            {{/tasks_done}}

            {{#tasks_done}}
                {{>weekly_task}}
            {{/tasks_done}}
          </div>
        </div>
    </div>
  </div>
</div>