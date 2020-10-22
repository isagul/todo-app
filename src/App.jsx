import React, { useContext, useEffect } from 'react';
import { Divider, Select } from 'antd';
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
} from '@ant-design/icons';
import { Store } from './store';
import {
  sortByDate,
  setTasks,
  setLoading
} from './actions/index';
import { axiosInstance } from './utils/AxiosConfig';
import FilterArea from './components/FilterArea';
import ListTodos from './components/ListTodos';
import AddTask from './components/AddTask';
import './App.scss';

const { Option } = Select;

function App() {
  const { state, dispatch } = useContext(Store);
  const { currentFilter, sortingValue } = state;

  useEffect(() => {
    setLoading({ status: true }, dispatch);
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
        setLoading({ status: false }, dispatch);
      })
  }, [dispatch]);

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
          <AddTask />
          <Divider orientation="left">TODOS</Divider>
          <Select
            className="list-by-date"
            placeholder="Sort by Date"
            onChange={onChangeSortByDate}
            value={sortingValue}
          >
            <Option value="asc"><SortAscendingOutlined /> Sort Date Ascending</Option>
            <Option value="desc"><SortDescendingOutlined /> Sort Date Descending</Option>
          </Select>
          <ListTodos />
        </div>
      </div>
    </div>
  );
}

export default App;
