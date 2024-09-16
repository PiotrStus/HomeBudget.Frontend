const getNotificationTitle = (notification) => {
    if (notification.content === 'CategoryLimitExceeded') {
        return `Przekroczono limit w kategorii ${notification.categoryName}`;
    } else {
        return notification.content;
    }
};

export default getNotificationTitle;