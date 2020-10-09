import React, { useContext, useState, useEffect } from 'react';
import { Input, Checkbox, Divider, Popconfirm, Select, Button, message, Spin, Pagination } from 'antd';
import {
  QuestionCircleOutlined,
  CheckCircleOutlined,
  UnorderedListOutlined,
  ClockCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
  RestOutlined
} from '@ant-design/icons';
import { Store } from './store';
import { 
  addTask, 
  filterTasks, 
  sortByDate, 
  setTasks, 
  deleteTaskPerm, 
  deleteTaskTemp,
  updateStatus 
} from './actions/index';
import { axiosInstance } from './utils/AxiosConfig';
import './App.scss';

const dateFormat = require('dateformat');
const { Option } = Select;

const taskStatus = [
  { id: 1, label: 'All', key: 'all', icon: <UnorderedListOutlined /> },
  { id: 2, label: 'Active', key: 'active', icon: <ClockCircleOutlined /> },
  { id: 3, label: 'Completed', key: 'completed', icon: <CheckCircleOutlined /> },
  { id: 4, label: 'Recently Deleted', key: 'deleted', icon: <RestOutlined /> }
];

function App() {
  const [taskName, setTaskName] = useState('');  // it holds new task that will be added
  const [currentFilter, setCurrentFilter] = useState('all'); // it holds filter name located on the left side of the page
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const linksPerPage = 5;

  const { state, dispatch } = useContext(Store);
  const { filteredTasks } = state;

  useEffect(() => {
    setLoading(true);
    axiosInstance.get('/task')
      .then(function (response) {
        // handle success
        if (response.status === 200) {
          setTasks({
            data: response.data.result.filter(task => task.status !== 'deleted')
          }, dispatch)
          setLoading(false);
        }
      })
      .catch(function (error) {
        // handle error
        setLoading(false);
        console.log(error);
      })
  }, [dispatch]);

  function getCurrentTasks() {
    const indexOfLastLink = currentPage * linksPerPage;
    const indexOfFirstLink = indexOfLastLink - linksPerPage;
    return filteredTasks.slice(indexOfFirstLink, indexOfLastLink);
  }

  function getPaginationChange(page) {
    setCurrentPage(page);
  }

  function onChangeStatus(e, item) {
    setLoading(true);
    axiosInstance.post('/task/update', {
      id: item._id,
      value: e.target.checked ? 'completed' : 'active'
    })
      .then(function (response) {
        if (response.status === 200) {
          updateStatus({
            data: response.data.result,
            currentStatusFilter: currentFilter
          }, dispatch)
          setLoading(false);
        }
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
      });
  }

  function getStatus(status) {
    setLoading(true);
    axiosInstance.post('/task/by-status', {
      status: status.key
    })
      .then(function (response) {
        if (response.status === 200) {
          setCurrentFilter(status.key);
          filterTasks({
            data: response.data.result,
            currentStatusFilter: status.key
          }, dispatch)
          setLoading(false);
          setCurrentPage(1);
        }
      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      })

  }

  function addTaskTodo() {
    if (taskName && taskName.trim().length > 0) {
      setLoading(true);
      axiosInstance.post('/task/create', {
        content: taskName,
        date: dateFormat(new Date())
      })
        .then(function (response) {
          if (response.status === 200) {
            addTask({
              task: response.data.addedTask,
              currentStatusFilter: currentFilter
            }, dispatch)

            setTaskName('');
            setLoading(false);
            message.success("The task was added successfully");
          }
        })
        .catch(function (error) {
          console.log(error);
          setLoading(false);
        });
    } else {
      message.warn("Please type something into todo field");
    }
  }

  function deleteTaskPermanently(item) {
    setLoading(true);
    axiosInstance.delete(`/task/delete-permanently/${item._id}`)
      .then(function (response) {
        if (response.status === 200) {
          deleteTaskPerm({
            data: response.data.result,
            currentStatusFilter: currentFilter
          }, dispatch)
          setLoading(false);
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          }
        }

      })
      .catch(function (error) {
        console.log(error);
        setLoading(false);
      });
  }

  function deleteTaskTemporarily(item) {
    axiosInstance.post('/task/delete-temporarily', {
      id: item._id
    })
      .then(function (response) {
        setLoading(true);
        if (response.status === 200) {
          deleteTaskTemp({
            data: response.data.result.filter(item => item.status !== 'deleted'),
            currentStatusFilter: currentFilter
          }, dispatch)
          setLoading(false);
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage(currentPage - 1);
            }
          }
        }
      })
      .catch(function (error) {
        setLoading(false);
        console.log(error);
      });
  }

  function onChangeSortByDate(value) {
    sortByDate({
      sortValue: value,
      currentStatusFilter: currentFilter
    }, dispatch)
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
                  <li key={id} onClick={() => getStatus(status)} className={key === currentFilter ? 'active' : ''}>
                    {icon && icon} {label}
                  </li>
                )
              })
            }
          </ul>
        </div>
        <div className="add-list-area">
          <Divider>TODO APP</Divider>
          <div className="add-bar">
            <Input
              placeholder="Add task"
              size="middle"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              onPressEnter={() => addTaskTodo()}
            />
            <Button onClick={() => addTaskTodo()}>Add</Button>
          </div>

          <Divider orientation="left">TODOS</Divider>
          {currentFilter !== 'deleted' &&
            <Select
              className="list-by-date"
              showSearch
              placeholder="Sort by Date"
              optionFilterProp="children"
              onChange={onChangeSortByDate}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <Option value="asc"><SortAscendingOutlined /> Sort Ascending</Option>
              <Option value="desc"><SortDescendingOutlined /> Sort Descending</Option>
            </Select>}
          <Spin spinning={loading}>
            <ul className="list-tasks">
              {
                filteredTasks.length > 0 ? getCurrentTasks().map((item, index) => {
                  return (
                    <div key={index} className={'task ' + (item.status === 'completed' ? 'completed' : '')}>
                      <li className="task-name">
                        <Checkbox
                          onChange={(event) => onChangeStatus(event, item)}
                          checked={item.status === 'completed'}
                          disabled={item.status === 'deleted'}
                        >
                          {item.content}
                        </Checkbox>
                      </li>
                      <div className="delete-task">
                        {
                          item.status !== 'deleted' ?
                            <Popconfirm
                              disabled={item.status === 'deleted'}
                              title="Are you sure？"
                              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                              onConfirm={() => deleteTaskTemporarily(item)}>
                              Delete
                            </Popconfirm> :
                            <Popconfirm
                              title="Are you sure"
                              icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
                              onConfirm={() => deleteTaskPermanently(item)}>
                              Delete Permanently
                            </Popconfirm>
                        }
                      </div>
                      <span className="task-date">{item.date}</span>
                    </div>
                  )
                }) : <span>There is no task here.</span>
              }
            </ul>
          </Spin>

          {currentFilter !== 'deleted' && <span className="left-items-info"><strong>{state.tasks.filter(task => task.status === 'active').length}</strong> items left</span>}
          {
            filteredTasks.length > 0 &&
            <Pagination
              defaultCurrent={1}
              current={currentPage}
              total={filteredTasks.length}
              pageSize={linksPerPage}
              onChange={getPaginationChange}
            />
          }
        </div>
      </div>
    </div>
  );
}

export default App;