function messagesCombiner ([messages_], messageComponent) {
    return messages_.map(item => {
        return {
            id: item.id,
            message: React.createElement(messageComponent, item)
        }
    })
}

export default messagesCombiner
