'use client';
import App from '@/App';
import store from '@/store';
import { Provider } from 'react-redux';
import { ReactNode, Suspense } from 'react';
import LayerLoading from '../Elements/loadings/LayerLoading';

interface IProps {
  children?: ReactNode;
}

const ProviderComponent = ({ children }: IProps) => {
  return (
    <Provider store={store}>
      <Suspense fallback={<LayerLoading />}>
        <App>{children} </App>
      </Suspense>
    </Provider>
  );
};

export default ProviderComponent;
// todo
// export default appWithI18Next(ProviderComponent, ni18nConfig);
