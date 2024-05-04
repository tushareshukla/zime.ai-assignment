import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table } from 'antd';
import Highlighter from 'react-highlight-words';

const TableComponent = () => {
  const [postData, setPostData] = useState([]);
  const [pagination, setPagination] = useState({ skip: 0, limit: 10 });
  const [loading, setLoading] = useState(false);
  
 // eslint-disable-next-line
  const [error, setError] = useState(null);

  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef(null);

  const fetchPaginatedData = async (skip, limit) => {
    try {

        setLoading(true);
        // console.log(error)
        const url = `https://dummyjson.com/posts?skip=${skip}&limit=${limit}`;
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch data' );
        
        }
        const responseData = await response.json();
        const posts = responseData.posts || []; 
        console.log('Fetched posts:', posts); 
        setPostData(posts);
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
  };

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText('');
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />,
    onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ...getColumnSearchProps('title'),
    },
    {
      title: 'Body',
      dataIndex: 'body',
      key: 'body',
      ...getColumnSearchProps('body'),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      ...getColumnSearchProps('tags'),
    },
  ];

  useEffect(() => {
    fetchPaginatedData(pagination.skip, pagination.limit);
  }, [pagination]);

  return (
    <Table
      columns={columns}
      dataSource={postData}
      pagination={{
        total: postData.length, // Assuming total number of items is available
        pageSize: pagination.limit,
        current: pagination.skip / pagination.limit + 1,
        onChange: (page, pageSize) => setPagination({ skip: (page - 1) * pageSize, limit: pageSize }),
      }}
      loading={loading}
      rowKey="id"
    />
  );
};

export default TableComponent;
