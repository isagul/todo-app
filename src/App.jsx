import React, { useContext, useState, useEffect } from 'react';
import { Input, Checkbox, Divider, Popconfirm, Select, Button, message, Spin, Pagination } from 'antd';
import {
  QuestionCircleOutlined,
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Store } from './store';
import { 
  addTask, 
  sortByDate, 
  setTasks, 
  deleteTaskPerm, 
  deleteTaskTemp,
  updateStatus,
  setLoading,
  setCurrentPage
} from './actions/index';
import { axiosInstance } from './utils/AxiosConfig';
import FilterArea from './components/FilterArea';
import './App.scss';

const dateFormat = require('dateformat');
const { Option } = Select;

function App() {
  const [taskName, setTaskName] = useState('');
  const linksPerPage = 5;

  const { state, dispatch } = useContext(Store);
  const { filteredTasks, loading, currentPage, currentFilter } = state;

  useEffect(() => {
    setLoading({status: true}, dispatch);
    axiosInstance.get('/task')
      .then(function (response) {
        if (response.status === 200) {
          setTasks({
            data: response.data.result.filter(task => task.status !== 'deleted')
          }, dispatch)
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({status: false}, dispatch);
      })
  }, [dispatch]);

  function getCurrentTasks() {
    const indexOfLastLink = currentPage * linksPerPage;
    const indexOfFirstLink = indexOfLastLink - linksPerPage;
    return filteredTasks.slice(indexOfFirstLink, indexOfLastLink);
  }

  function getPaginationChange(page) {
    setCurrentPage({value: page}, dispatch);
  }

  function onChangeStatus(e, item) {
    setLoading({status: true}, dispatch);
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
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({status: false}, dispatch);
      })
  }

  function addTaskTodo() {
    if (taskName && taskName.trim().length > 0) {
      setLoading({status: true}, dispatch);
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
            message.success("The task was added successfully");
          }
        })
        .catch(function (error) {
          console.log(error);
        })
        .then(() => {
          setLoading({status: false}, dispatch);
        })
    } else {
      message.warn("Please type something into todo field");
    }
  }

  function deleteTaskPermanently(item) {
    setLoading({status: true}, dispatch);
    axiosInstance.delete(`/task/delete-permanently/${item._id}`)
      .then(function (response) {
        if (response.status === 200) {
          deleteTaskPerm({
            data: response.data.result,
            currentStatusFilter: currentFilter
          }, dispatch)
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage({value: currentPage - 1}, dispatch);
            }
          }
        }

      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({status: false}, dispatch);
      })
  }

  function deleteTaskTemporarily(item) {
    axiosInstance.post('/task/delete-temporarily', {
      id: item._id
    })
      .then(function (response) {
        setLoading({status: true}, dispatch);
        if (response.status === 200) {
          deleteTaskTemp({
            data: response.data.result.filter(item => item.status !== 'deleted'),
            currentStatusFilter: currentFilter
          }, dispatch)
          if (getCurrentTasks().length === 1) {
            if (currentPage > 1) {
              setCurrentPage({value: currentPage - 1}, dispatch);
            }
          }
        }
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(() => {
        setLoading({status: false}, dispatch);
      })
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
          <FilterArea />
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
