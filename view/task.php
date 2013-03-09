<li id="task-{{id}}">
    <div class="task {{#complete}}task-complete {{/complete}}" data-taskid="{{id}}">
        <div class="task-details">
            <div class="task-info">
                <div class="expander {{#expanded}}open{{/expanded}}{{^expanded}}closed{{/expanded}}"><span class="icon icon-minus"></span><span class="icon icon-plus"></span></div>
                <div data-taskid="{{id}}" class="task-status task-color-{{color}} {{#complete}}task-complete {{/complete}}"><span class="icon icon-ok"></span></div>
                <div class="task-label">
                    <div class="task-title task-color-{{color}}">{{title}}</div>
                    <div class="task-date">{{dateFormat}}</div>
                </div>
            </div>
            <ul class="task-actions">
                <li class="task-color">
                    <span class="icon icon-caret-down"></span><span class="current-color task-color-{{color}}"></span>
                    <ul class="task-color-options">
                        <li><span class="color-option task-color-red" data-color="red"></span>
                        <li><span class="color-option task-color-black" data-color="black"></span>
                        <li><span class="color-option task-color-grey" data-color="grey"></span>
                    </ul>
                </li>
            </ul>
        </div>
    </div>
    <ul class="task-children {{#expanded}}open{{/expanded}}{{^expanded}}closed{{/expanded}}"></ul>

</li>
