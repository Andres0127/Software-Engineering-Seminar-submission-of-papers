import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Category, Event, Location } from '../types';
import { EventService } from '../services/eventService';

interface FormState {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
  ticketPrice: number;
  categoryId: string;
  locationId: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  maxTicketsPerPurchase: number;
  ageRestriction: string;
}

const INITIAL_FORM: FormState = {
  title: '',
  description: '',
  startDate: '',
  endDate: '',
  maxAttendees: 50,
  ticketPrice: 120000,
  categoryId: '',
  locationId: '',
  status: 'DRAFT',
  maxTicketsPerPurchase: 10,
  ageRestriction: '',
};

const toDateInputValue = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export const CreateEventPage: React.FC = () => {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const eventId = id ? parseInt(id, 10) : undefined;
  const isEditMode = !!eventId;

  const isLoading = metaLoading || eventLoading;

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [categoriesData, locationsData] = await Promise.all([
          EventService.getCategories(),
          EventService.getLocations(),
        ]);
        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (error: any) {
        console.error('Error loading metadata', error);
        toast.error('Unable to load categories or locations');
      } finally {
        setMetaLoading(false);
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!eventId) return;

    const loadEvent = async () => {
      try {
        setEventLoading(true);
        const eventData = await EventService.getEventById(eventId);
        setForm({
          title: eventData.title,
          description: eventData.description || '',
          startDate: toDateInputValue(eventData.startDate),
          endDate: eventData.endDate ? toDateInputValue(eventData.endDate) : '',
          maxAttendees: eventData.maxAttendees,
          ticketPrice: eventData.ticketPrice,
          categoryId: eventData.categoryId?.toString() || '',
          locationId: eventData.locationId?.toString() || '',
          status: eventData.status as FormState['status'],
          maxTicketsPerPurchase: eventData.maxTicketsPerPurchase ?? 10,
          ageRestriction: eventData.ageRestriction || '',
        });
      } catch (error: any) {
        console.error('Error loading event', error);
        toast.error('Unable to load the event for editing');
      } finally {
        setEventLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const statusOptions = useMemo(
    () => ['DRAFT', 'PUBLISHED', 'CANCELLED'],
    []
  );

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'maxAttendees' || name === 'ticketPrice'
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.categoryId || !form.locationId) {
      toast.error('Please select a category and location');
      return;
    }

    setSaving(true);
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      maxAttendees: form.maxAttendees,
      ticketPrice: form.ticketPrice,
      categoryId: Number(form.categoryId),
      locationId: Number(form.locationId),
      status: form.status,
      maxTicketsPerPurchase: form.maxTicketsPerPurchase,
      ageRestriction: form.ageRestriction,
    };

    try {
      if (isEditMode && eventId) {
        await EventService.updateEvent(eventId, payload);
        toast.success('Event updated successfully');
        navigate(`/events/${eventId}`);
      } else {
        await EventService.createEvent(payload);
        toast.success('Event created successfully');
        navigate('/organizer');
      }
    } catch (error: any) {
      console.error(isEditMode ? 'Error updating event' : 'Error creating event', error);
      toast.error(error.response?.data?.detail || 'Error processing the event');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" style={{ width: '48px', height: '48px' }}></div>
      </div>
    );
  }

  return (
    <div className="card p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditMode ? 'Edit event' : 'Create new event'}
        </h1>
        <p className="text-gray-600">
          {isEditMode
            ? 'Update the details and publish or cancel your event.'
            : 'Provide the details to publish your next experience.'}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
          <label className="label" htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input"
              placeholder="Innovation conference"
              required
            />
          </div>

          <div>
          <label className="label" htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="select"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="input"
            rows={4}
            placeholder="Describe the themes, speakers, and added value of the event."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label" htmlFor="startDate">Start</label>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={form.startDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="endDate">End</label>
            <input
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={form.endDate}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label" htmlFor="maxAttendees">Capacity</label>
            <input
              id="maxAttendees"
              name="maxAttendees"
              type="number"
              value={form.maxAttendees}
              min={10}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="ticketPrice">Ticket Price (COP)</label>
            <input
              id="ticketPrice"
              name="ticketPrice"
              type="number"
              value={form.ticketPrice}
              min={0}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label" htmlFor="maxTicketsPerPurchase">Purchase limit</label>
            <input
              id="maxTicketsPerPurchase"
              name="maxTicketsPerPurchase"
              type="number"
              value={form.maxTicketsPerPurchase}
              min={1}
              onChange={handleChange}
              className="input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
              <label className="label" htmlFor="categoryId">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="select"
              required
            >
            <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="locationId">Location</label>
            <select
              id="locationId"
              name="locationId"
              value={form.locationId}
              onChange={handleChange}
              className="select"
              required
            >
              <option value="">Select a location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id.toString()}>
                  {location.name} · {location.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="ageRestriction">Age restriction</label>
            <input
              id="ageRestriction"
              name="ageRestriction"
              type="text"
              value={form.ageRestriction}
              onChange={handleChange}
              className="input"
              placeholder="E.g. 18+"
            />
          </div>
        </div>

        <div className="text-right">
          <button
            type="submit"
            className="btn-success"
            disabled={saving}
          >
            {saving
              ? isEditMode
                ? 'Saving changes...'
                : 'Creating event...'
              : isEditMode
              ? 'Save changes'
              : 'Create event'}
          </button>
        </div>
      </form>
    </div>
  );
};

