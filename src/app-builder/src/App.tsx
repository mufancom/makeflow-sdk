import {Layout} from 'antd';
import React, {FC} from 'react';

import './App.css';

const {Header, Footer, Content} = Layout;

const App: FC = () => {
  return (
    <Layout className="app">
      <Header>Header</Header>
      <Content>Content</Content>
      <Footer>© 2020 成都木帆科技有限公司</Footer>
    </Layout>
  );
};

export default App;
