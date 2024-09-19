const getNotificationTitle = (notification) => {
    if (notification.content === 'CategoryLimitExceeded') {
        return `Planowany limit w kategorii ${notification.categoryName} został przekroczony`;
    } else {
        return notification.content;
    }
};

export default getNotificationTitle;