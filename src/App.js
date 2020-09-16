import React, { useContext, useState } from 'react';
import { Input, Checkbox, Divider, Popconfirm, Select } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Store } from './store';
import { ADD_TASK, UPDATE_STATUS, GET_FILTER_TASKS, DELETE_TASK, SORT_BY_DATE } from './actions/index';
import './App.scss';

const dateFormat = require('dateformat');
const { Option } = Select;

const taskStatus = [
  { id: 1, label: 'All', key: 'all' },
  { id: 2, label: 'Active', key: 'active' },
  { id: 3, label: 'Completed', key: 'completed' }
]

function App() {
  const [taskName, setTaskName] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const { state, dispatch } = useContext(Store);
  const { filteredTasks } = state;

  function onChangeStatus(e, item) {
    dispatch({
      type: UPDATE_STATUS,
      payload: {
        task: item,
        value: e.target.checked,
        currentStatusFilter: currentFilter
      }
    });
  }

  function getStatus(status) {
    setCurrentFilter(status.key);
    dispatch({
      type: GET_FILTER_TASKS,
      payload: status
    })
  }

  function addTask() {
    const newTask = {
      id: '_' + Math.random().toString(36).substr(2, 9),
      status: 'active',
      content: taskName,
      date: dateFormat(new Date())
    }
    dispatch({
      type: ADD_TASK,
      payload: {
        task: newTask,
        currentStatusFilter: currentFilter
      }
    });
    setTaskName('');
  }

  function deleteTask(item) {
    dispatch({
      type: DELETE_TASK,
      payload: {
        task: item,
        currentStatusFilter: currentFilter
      }
    });
  }

  function onChange(value) {
    dispatch({
      type: SORT_BY_DATE,
      payload: {
        sortValue: value,
        currentStatusFilter: currentFilter
      }
    });
  }

  return (
    <div className="app-component">
      <div className="content">
        <div className="status-area">
          <Divider orientation="left">Filters</Divider>
          <ul className="status-list">
            {
              taskStatus.map(status => {
                return (
                  <div key={status.id}>
                    <li onClick={() => getStatus(status)} className={status.key === currentFilter ? 'active' : ''}>{status.label}</li>
                  </div>
                )
              })
            }
          </ul>
        </div>
        <div className="add-list-area">
          <Divider>TODO APP</Divider>
          <Input
            className="add-bar"
            placeholder="Add task"
            size="middle"
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            onPressEnter={() => addTask()}
          />
          <Divider orientation="left">TODOS</Divider>
          <Select
            className="list-by-date"
            showSearch
            style={{ width: 200 }}
            placeholder="Sort by Date"
            optionFilterProp="children"
            onChange={onChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            <Option value="asc">Sort Ascending</Option>
            <Option value="desc">Sort Descending</Option>
          </Select>
          <ul className="list-tasks">
            {
              filteredTasks.length > 0 ? filteredTasks.map((item, index) => {
                return (
                  <div key={index} className={'task ' + (item.status === 'completed' ? 'completed' : '')}>
                    <li className="task-name">
                      <Checkbox onChange={(event) => onChangeStatus(event, item)} checked={item.status === 'completed'}>{item.content}</Checkbox>
                    </li>
                    <span className="delete-task">
                      <Popconfirm title="Are you sure？" icon={<QuestionCircleOutlined style={{ color: 'red' }} />} onConfirm={() => deleteTask(item)}>
                        Delete
                      </Popconfirm>
                    </span>
                    <span className="task-date">{item.date}</span>
                  </div>
                )
              }) : <span>There is no any saved tasks here.</span>
            }
          </ul>
          <span className="left-items-info"><strong>{state.tasks.filter(task => task.status === 'active').length}</strong> items left</span>
        </div>
      </div>
    </div>
  );
}

export default App;
