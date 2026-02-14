import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Header from './Header';
import FilterBottomSheet from '../common/FilterBottomSheet';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <main className="pt-20 pb-28 px-4 max-w-md mx-auto w-full">
                <Outlet />
            </main>
            <BottomNav />
            <FilterBottomSheet />
        </div>
    );
};

export default Layout;
