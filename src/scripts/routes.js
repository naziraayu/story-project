// src/scripts/routes.js
import Home from './views/home';
import Detail from './views/detail';
import Add from './views/add';
import Login from './views/login';
import Register from './views/register';
import HomePresenter from './presenter/home-presenter';
import DetailPresenter from './presenter/detail-presenter';
import AddPresenter from './presenter/add-presenter';
import Favorite from './views/favorite.js';
import FavoritePresenter from './presenter/favorite-presenter'; // ← Tambahkan ini


const routes = {
    '/': {
        view: Home,
        presenter: new HomePresenter(),
    },
    '/detail/:id': {
        view: Detail,
        presenter: new DetailPresenter(),
    },
    '/add': {
        view: Add,
        presenter: new AddPresenter(),
    },
    '/login': {
        view: Login,
        presenter: null,
    },
    '/register': {
        view: Register,
        presenter: null,
    },
    '/favorite': {
        view: Favorite,
        presenter: new FavoritePresenter({
        viewContainer: document.querySelector('#mainContent'),
        }),
    },
};

export default routes;