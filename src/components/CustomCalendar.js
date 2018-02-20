import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import Modal from 'react-modal';
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-datepicker/dist/react-datepicker.css';
import events from '../stubEvents'

BigCalendar.setLocalizer(
    BigCalendar.momentLocalizer(moment)
);

const customStyles = {
    content : {
        top                   : '50%',
        left                  : '50%',
        right                 : 'auto',
        bottom                : 'auto',
        marginRight           : '-50%',
        transform             : 'translate(-50%, -50%)',
        backgroundColor       : 'rgba(0, 0, 0, 0)',
    }
};

export class CustomCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            events: events,
            eventName: '',
            startDate: moment(),
            finishDate: moment(),
            eventId: null,
            eventStateIndex: -1,
            isCreateModalOpen: false,
            isEditModalOpen: false,
            isUpdateModalOpen: false,
            confirmMarker: false,
            isInfoModalOpen: false,
            infoMessage: '',
        };
        this.openCreateModal = this.openCreateModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.closeEditModal = this.closeEditModal.bind(this);
        this.handleCreateClick = this.handleCreateClick.bind(this);
        this.handleSelectEvent = this.handleSelectEvent.bind(this);
        this.handleSelectSlot = this.handleSelectSlot.bind(this);
        this.handleStartDateChange = this.handleStartDateChange.bind(this);
        this.handleFinishDateChange = this.handleFinishDateChange.bind(this);
        this.handleEventNameChange = this.handleEventNameChange.bind(this);
        this.clearEventValues = this.clearEventValues.bind(this);
        this.checkEventsConsistence = this.checkEventsConsistence.bind(this);
        this.handleDeleteClick = this.handleDeleteClick.bind(this);
        this.handleUpdateClick = this.handleUpdateClick.bind(this);
        this.closeUpdateModal = this.closeUpdateModal.bind(this);
        this.handleSaveUpdateClick = this.handleSaveUpdateClick.bind(this);
        this.getEventStateIndex = this.getEventStateIndex.bind(this);
        this.isEquivalent = this.isEquivalent.bind(this);
        this.closeInfoModal = this.closeInfoModal.bind(this);
        this.openInfoModal = this.openInfoModal.bind(this);
        this.handleInfoClick = this.handleInfoClick.bind(this);
    }

    handleInfoClick() {
        this.setState({
            confirmMarker: true,
            isInfoModalOpen: false,
        })
    }

    closeInfoModal() {
        this.setState({
            confirmMarker: false,
            isInfoModalOpen: false,
            infoMessage: '',
        })
    }

    clearEventValues() {
        this.setState({
            eventName: '',
            startDate: moment(),
            finishDate: moment(),
            eventId: null,
            eventStateIndex: -1,
            isCreateModalOpen: false,
            isEditModalOpen: false,
            isUpdateModalOpen: false,
            confirmMarker: false,
        });
    }

    randomInteger(min, max) {
        let rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return rand;
    }

    checkEventValues() {
        if (
            (this.state.eventName.length >=1)&&
            (moment().diff(this.state.startDate)<=0)&&
            (this.state.startDate.diff(this.state.finishDate)<=0)
        ) {
            return this.checkEventsConsistence()
        }else {
            this.openInfoModal("Нельзя создать Мероприятие. Проверьте название и даты проведения.");
            return false
        }
    }

    isEquivalent(element, index, array) {
        const { eventName, startDate, finishDate } = this.state;
        if (
            (element.title !== eventName) &&
            (
                (finishDate.diff(moment(element.start))<=0) ||
                (startDate.diff(moment(element.end))>=0)
            ) && (startDate.diff(finishDate) !== 0)
        ) {
            return false;
        } else {
            return true;
        }
    }

    checkEventsConsistence() {
        const { events } = this.state;
        const duplicated_event = events.find(this.isEquivalent)
        if (typeof(duplicated_event) !== 'undefined') {
            if (duplicated_event.title === this.state.eventName) {
                this.openInfoModal("имена мероприятий совпадают.");
                return true;
            } else {
                this.openInfoModal("Никакие назначения не должны пересекаться. Проверьте даты.");
            }
            return false;
        } else {
            return true
        }
    }

    openCreateModal() {
        this.setState({ isCreateModalOpen: true })
    }

    openInfoModal(text) {
        this.setState({
            infoMessage: text,
            isInfoModalOpen: true
        })
    }

    closeModal() {
        this.setState({ isCreateModalOpen: false })
    }

    closeEditModal() {
        this.setState({ isEditModalOpen: false })
    }

    closeUpdateModal() {
        this.setState({ isUpdateModalOpen: false })
    }

    handleSaveUpdateClick() {
        this.handleCreateClick()
    }

    handleDeleteClick() {
        const { events, eventStateIndex } = this.state;
        events.splice(eventStateIndex, 1);
        this.setState({
            events: events,
        });
        this.clearEventValues();
        this.setState({ isEditModalOpen: false })
    }

    handleUpdateClick() {
        this.setState({
            isEditModalOpen: false,
            isUpdateModalOpen: true
        })
    }

    getEventStateIndex() {
        const { eventStateIndex, events } = this.state;
        if (eventStateIndex === -1) {
            return events.length
        } else {
            return eventStateIndex
        }
    }

    handleCreateClick() {
        if (this.checkEventValues()) {
            const { events } = this.state;
            const title = this.state.eventName;
            const start = this.state.startDate.toDate();
            const end = this.state.finishDate.toDate();
            const id = this.randomInteger(events.length, 1000);
            const newEvent = { start, end, title, id };
            const nextEvents = [...events];
            nextEvents.splice(this.getEventStateIndex(), 1, newEvent);
            this.setState({
                events: nextEvents,
            });
            this.clearEventValues()
        }
    }

    handleSelectEvent(event) {
        const { id, title, start, end } = event;
        const startDate = moment(start);
        const finishDate = moment(end);
        const { events } = this.state;
        this.setState({
            eventName: title,
            startDate: startDate,
            finishDate: finishDate,
            eventId: id,
            eventStateIndex: events.indexOf(event)
        });

        this.setState({ isEditModalOpen: true });
    }

    handleSelectSlot({ start, end }) {
        const startDate = moment(start);
        const finishDate = moment(end);
        this.setState({
            startDate: startDate,
            finishDate: finishDate,
        });
        this.openCreateModal();
    }

    handleStartDateChange(date) {
        this.setState({
            startDate: date
        });
    }

    handleFinishDateChange(date) {
        this.setState({
            finishDate: date
        });
    }

    handleEventNameChange(event) {
        this.setState({
            eventName: event.target.value
        });
    }

    render() {
        const {infoMessage} = this.state;
        return (
            <React.Fragment>
                <div className="rbc-toolbar">
                    <button
                        className="eventButton"
                        onClick={this.openCreateModal}
                    >create Event
                    </button>
                </div>
                <Modal
                    appElement={document.getElementById('root')}
                    contentLabel="Create Event"
                    isOpen={this.state.isCreateModalOpen}
                    onClose={() => this.closeModal()}
                >
                    <h5>Create event</h5>
                    <input
                        type="text"
                        value={this.state.eventName}
                        onChange={this.handleEventNameChange}
                    />
                    <DatePicker
                        showTimeSelect
                        isClearable={true}
                        minDate={moment()}
                        dateFormat="DD-MM-YY HH:mm"
                        selected={this.state.startDate}
                        onChange={this.handleStartDateChange}
                    />
                    <DatePicker
                        showTimeSelect
                        isClearable={true}
                        startDate={this.state.startDate}
                        dateFormat="DD-MM-YY HH:mm"
                        selected={this.state.finishDate}
                        onChange={this.handleFinishDateChange}
                    />
                    <p>
                        <button onClick={() => this.handleCreateClick()}>Create</button>
                        <button onClick={() => this.closeModal()}>Cancel</button>
                    </p>
                </Modal>
                <Modal
                    appElement={document.getElementById('root')}
                    contentLabel="Update Event"
                    isOpen={this.state.isUpdateModalOpen}
                    onClose={() => this.closeUpdateModal()}
                >
                    <h5>Update event</h5>
                    <input
                        type="text"
                        value={this.state.eventName}
                        onChange={this.handleEventNameChange}
                    />
                    <DatePicker
                        showTimeSelect
                        isClearable={true}
                        minDate={moment()}
                        dateFormat="DD-MM-YY HH:mm"
                        selected={this.state.startDate}
                        onChange={this.handleStartDateChange}
                    />
                    <DatePicker
                        showTimeSelect
                        isClearable={true}
                        startDate={this.state.startDate}
                        dateFormat="DD-MM-YY HH:mm"
                        selected={this.state.finishDate}
                        onChange={this.handleFinishDateChange}
                    />
                    <p>
                        <button onClick={() => this.handleSaveUpdateClick()}>Update</button>
                        <button onClick={() => this.closeUpdateModal()}>Cancel</button>
                    </p>
                </Modal>
                <Modal
                    contentLabel="Info"
                    appElement={document.getElementById('root')}
                    isOpen={this.state.isInfoModalOpen}
                    onClose={()=> this.closeInfoModal()}
                    style={customStyles}
                >
                    <label>{infoMessage}</label>
                    <p>
                    <button onClick={() => this.closeInfoModal()}>OK</button>
                    </p>
                </Modal>
                <Modal
                    contentLabel="Edit Event"
                    appElement={document.getElementById('root')}
                    isOpen={this.state.isEditModalOpen}
                    onClose={() => this.closeEditModal()}
                >
                    <h5>Edit event</h5>
                    <input
                        type="text"
                        readOnly
                        value={this.state.eventName}
                    />
                    <p>
                    <input
                        type="text"
                        readOnly
                        value={this.state.startDate.format('DD-MM-YY HH:mm')}
                    />
                    </p>
                    <p>
                        <input
                            type="text"
                            readOnly
                            value={this.state.finishDate.format('DD-MM-YY HH:mm')}
                        />
                    </p>
                    <p>
                        <button onClick={() => this.handleUpdateClick()}>Update</button>
                        <button onClick={() => this.handleDeleteClick()}>Delete</button>
                        <button onClick={() => this.closeEditModal()}>Cancel</button>
                    </p>
                </Modal>
                <BigCalendar
                    selectable
                    style={{height: 800}}
                    events={this.state.events}
                    defaultView="month"
                    views={['month']}
                    scrollToTime={new Date(1970, 1, 1, 6)}
                    defaultDate={new Date()}
                    onSelectEvent={this.handleSelectEvent}
                    onSelectSlot={this.handleSelectSlot}
                />
            </React.Fragment>
        )
    }
}
