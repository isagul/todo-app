import React, { useContext, useState } from 'react';
import { Input, Checkbox, Divider, Popconfirm, Select } from 'antd';
import {
  DeleteOutlined,
  QuestionCircleOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined
} from '@ant-design/icons';
import { Store } from './store';
import { ADD_TASK, UPDATE_STATUS, GET_FILTER_TASKS, DELETE_TASK, SORT_BY_DATE, UNDO_TASK } from './actions/index';
import './App.scss';

const dateFormat = require('dateformat');
const { Option } = Select;

const taskStatus = [
  { id: 1, label: 'All', key: 'all', icon: <UnorderedListOutlined /> },
  { id: 2, label: 'Active', key: 'active', icon: <ClockCircleOutlined /> },
  { id: 3, label: 'Completed', key: 'completed', icon: <CheckCircleOutlined /> },
  { id: 4, label: 'Recently Deleted', key: 'recently_deleted', icon: <DeleteOutlined /> }
]

function App() {
  const [taskName, setTaskName] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all');
  const { state, dispatch } = useContext(Store);
  const { filteredTasks } = state;

  // console.log('state from app', state);

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

  function undoDeletedTask(item) {
    dispatch({
      type: UNDO_TASK,
      payload: item
    })
  }

  return (
    <div className="app-component">
      <div className="content">
        <div className="status-area">
          <Divider orientation="left">Filters</Divider>
          <ul className="status-list">
            {
              taskStatus.map(status => {
                const { icon, label, id, key } = status;
                return (
                  <div key={id}>
                    <li onClick={() => getStatus(status)} className={key === currentFilter ? 'active' : ''}>
                      {icon && icon} {label}
                    </li>
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
          {currentFilter !== 'recently_deleted' &&
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
              <Option value="asc"><SortAscendingOutlined /> Sort Ascending</Option>
              <Option value="desc"><SortDescendingOutlined /> Sort Descending</Option>
            </Select>}
          <ul className="list-tasks">
            {
              filteredTasks.length > 0 ? filteredTasks.map((item, index) => {
                return (
                  <div key={index} className={'task ' + (item.status === 'completed' ? 'completed' : '')}>
                    <li className="task-name">
                      {
                        currentFilter !== 'recently_deleted' ?
                          <Checkbox onChange={(event) => onChangeStatus(event, item)} checked={item.status === 'completed'}>{item.content}</Checkbox> :
                          item.content
                      }
                    </li>
                    <div className="delete-task">
                      {
                        currentFilter !== 'recently_deleted' ?
                          <Popconfirm title="Are you sure？" icon={<QuestionCircleOutlined style={{ color: 'red' }} />} onConfirm={() => deleteTask(item)}>
                            Delete
                          </Popconfirm> :
                          <span className="undo" onClick={() => undoDeletedTask(item)}>Undo</span>
                      }
                    </div>
                    <span className="task-date">{item.date}</span>
                  </div>
                )
              }) : <span>There is no any task here.</span>
            }
          </ul>
          {currentFilter !== 'recently_deleted' && <span className="left-items-info"><strong>{state.tasks.filter(task => task.status === 'active').length}</strong> items left</span>}
        </div>
      </div>
    </div>
  );
}

export default App;
