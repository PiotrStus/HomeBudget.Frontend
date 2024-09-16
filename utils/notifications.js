const getNotificationTitle = (notification) => {
    if (notification.content === 'CategoryLimitExceeded') {
        return `Przekroczono planowany limit w kategorii ${notification.categoryName}`;
    } else {
        return notification.content;
    }
};

export default getNotificationTitle;