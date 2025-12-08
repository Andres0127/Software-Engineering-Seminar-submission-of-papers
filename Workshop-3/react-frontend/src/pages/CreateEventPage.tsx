import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Category, Event, Location, LocationZone } from '../types';
import { EventService } from '../services/eventService';

interface FormState {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxAttendees: number;
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
  categoryId: '',
  locationId: '',
  status: 'PUBLISHED',
  maxTicketsPerPurchase: 10,
  ageRestriction: '',
};

interface ZoneForm {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
  benefits: string;
}

const createZoneId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

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
  const createZone = (overrides: Partial<ZoneForm> = {}): ZoneForm => ({
    id: createZoneId(),
    name: 'General Admission',
    price: 0,
    quantity: form.maxAttendees,
    description: '',
    benefits: '',
    ...overrides,
  });
  const [zones, setZones] = useState<ZoneForm[]>([createZone()]);
  const [locationZoneTemplates, setLocationZoneTemplates] = useState<LocationZone[]>([]);
  const [templateLocationId, setTemplateLocationId] = useState<string>('');

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
    if (!form.locationId) {
      setLocationZoneTemplates([]);
      setTemplateLocationId('');
      return;
    }

    let cancelled = false;
    EventService.getLocationZones(Number(form.locationId))
      .then((data) => {
        if (!cancelled) {
          setLocationZoneTemplates(data);
        }
      })
      .catch((error: any) => {
        console.error('Unable to load location zones', error);
        if (!cancelled) {
          setLocationZoneTemplates([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [form.locationId]);

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
          categoryId: eventData.categoryId?.toString() || '',
          locationId: eventData.locationId?.toString() || '',
          status: eventData.status as FormState['status'],
          maxTicketsPerPurchase: eventData.maxTicketsPerPurchase ?? 10,
          ageRestriction: eventData.ageRestriction || '',
        });
        setZones(
          eventData.ticketTypes && eventData.ticketTypes.length > 0
            ? eventData.ticketTypes.map((ticketType) => ({
                id: ticketType.id.toString(),
                name: ticketType.name,
                price: ticketType.price,
                quantity: ticketType.quantity,
                description: ticketType.description || '',
                benefits: ticketType.benefits || '',
              }))
            : [createZone({ quantity: eventData.maxAttendees })]
        );
      } catch (error: any) {
        console.error('Error loading event', error);
        toast.error('Unable to load the event for editing');
      } finally {
        setEventLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (isEditMode) return;
    const locationId = form.locationId;
    if (!locationId) {
      setZones([createZone()]);
      setTemplateLocationId('');
      return;
    }

    if (locationId === templateLocationId) return;

    if (locationZoneTemplates.length > 0) {
      setZones(
        locationZoneTemplates.map((template) => ({
          id: createZoneId(),
          name: template.name,
          price: template.price,
          quantity: template.quantity,
          description: template.description || '',
          benefits: template.benefits || '',
        }))
      );
    } else {
      setZones([createZone()]);
    }

    setTemplateLocationId(locationId);
  }, [locationZoneTemplates, form.locationId, isEditMode, templateLocationId]);

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
        name === 'maxAttendees' || name === 'maxTicketsPerPurchase'
          ? Number(value)
          : value,
    }));
  };

  const updateZoneField = (zoneId: string, field: keyof ZoneForm, value: string | number) => {
    setZones((prev) =>
      prev.map((zone) =>
        zone.id === zoneId
          ? {
              ...zone,
              [field]:
                field === 'price' || field === 'quantity'
                  ? Number(value)
                  : value,
            }
          : zone
      )
    );
  };

  const addZone = () => {
    setZones((prev) => [
      ...prev,
      createZone({ name: `Zone ${prev.length + 1}` }),
    ]);
  };

  const removeZone = (zoneId: string) => {
    setZones((prev) => (prev.length > 1 ? prev.filter((zone) => zone.id !== zoneId) : prev));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.categoryId || !form.locationId) {
      toast.error('Please select a category and location');
      return;
    }

    setSaving(true);
    setSaving(true);

    const zonePayloads = zones.map((zone) => ({
      name: zone.name,
      price: zone.price,
      quantity: zone.quantity,
      description: zone.description || undefined,
      benefits: zone.benefits || undefined,
    }));

    const payload = {
      title: form.title,
      description: form.description,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
      maxAttendees: form.maxAttendees,
      categoryId: Number(form.categoryId),
      locationId: Number(form.locationId),
      status: form.status,
      maxTicketsPerPurchase: form.maxTicketsPerPurchase,
      ageRestriction: form.ageRestriction,
      zones: zonePayloads,
    };

    try {
      if (isEditMode && eventId) {
        await EventService.updateEvent(eventId, payload);
        toast.success('Event updated successfully');
        navigate(`/events/${eventId}`);
      } else {
        const createdEvent = await EventService.createEvent(payload);
        console.log('Event created:', createdEvent);
        toast.success('Event created successfully');
        // Navigate to events page to see the newly created event
        // Use replace: false and add a timestamp to force refresh
        navigate('/events', { replace: false });
      }
    } catch (error: any) {
      console.error(isEditMode ? 'Error updating event' : 'Error creating event', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error message:', error.message);
      // Extract error message from different possible locations
      const errorMessage = error.message || error.response?.data?.detail || error.response?.data?.message || 'Error processing the event';
      toast.error(errorMessage);
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Ticket zones</h3>
              <p className="text-gray-600 text-sm">
                Define each zone (e.g., VIP, General) with price and capacity.
              </p>
            </div>
            <button
              type="button"
              onClick={addZone}
              className="btn-outline text-sm"
            >
              Add zone
            </button>
          </div>

          <div className="space-y-4">
            {zones.map((zone, index) => (
              <div
                key={zone.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">
                    Zone {index + 1}
                  </p>
                  {zones.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeZone(zone.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Name</label>
                    <input
                      type="text"
                      value={zone.name}
                      onChange={(e) => updateZoneField(zone.id, 'name', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Price (COP)</label>
                    <input
                      type="number"
                      min={0}
                      value={zone.price}
                      onChange={(e) => updateZoneField(zone.id, 'price', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={zone.quantity}
                      onChange={(e) => updateZoneField(zone.id, 'quantity', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Description</label>
                    <textarea
                      value={zone.description}
                      onChange={(e) => updateZoneField(zone.id, 'description', e.target.value)}
                      className="input"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="label">Benefits</label>
                    <textarea
                      value={zone.benefits}
                      onChange={(e) => updateZoneField(zone.id, 'benefits', e.target.value)}
                      className="input"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            ))}
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

