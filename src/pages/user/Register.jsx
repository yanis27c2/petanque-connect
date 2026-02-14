import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, MapPin, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const Register = () => {
    const navigate = useNavigate();
    const { register, isLoading, error } = useAuthStore();

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        departement: '',
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await register(formData);
        if (success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl mx-auto mb-4 transform -rotate-3">
                        PC
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Rejoignez le club
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Créez votre profil joueur en 2 minutes
                    </p>
                </div>

                <div className="bg-white py-8 px-4 shadow-card rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-danger-50 text-danger-600 p-3 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Prénom</label>
                                <input
                                    name="prenom"
                                    type="text"
                                    required
                                    className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-accent-500 focus:border-accent-500"
                                    placeholder="Jean"
                                    value={formData.prenom}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nom</label>
                                <input
                                    name="nom"
                                    type="text"
                                    required
                                    className="block w-full px-3 py-3 border border-gray-200 rounded-xl focus:ring-accent-500 focus:border-accent-500"
                                    placeholder="Dupont"
                                    value={formData.nom}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Département</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <select
                                    name="departement"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-accent-500 focus:border-accent-500 appearance-none bg-white"
                                    value={formData.departement}
                                    onChange={handleChange}
                                >
                                    <option value="">Choisir...</option>
                                    <option value="09">09 - Ariège</option>
                                    <option value="31">31 - Haute-Garonne</option>
                                    <option value="11">11 - Aude</option>
                                    <option value="32">32 - Gers</option>
                                    <option value="81">81 - Tarn</option>
                                    <option value="82">82 - Tarn-et-Garonne</option>
                                    <option value="65">65 - Hautes-Pyrénées</option>
                                    <option value="66">66 - Pyrénées-Orientales</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-accent-500 focus:border-accent-500"
                                    placeholder="vous@exemple.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mot de passe</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-accent-500 focus:border-accent-500"
                                    placeholder="Minimum 8 caractères"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl shadow-button text-sm font-bold text-white bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 transition-all active:scale-[0.98]"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Créer mon compte"}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-600">
                            Déjà inscrit ?{' '}
                            <Link to="/login" className="font-bold text-accent-600 hover:text-accent-500">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
